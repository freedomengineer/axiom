import Actor "actors/Actor";
import Actors "actors/Actors";
import Installation "installations/Installation";
import Installations "installations/Installations";
import Commitment "commitments/Commitment";
import Commitments "commitments/Commitments";
import UpgradeTasks "upgrade_tasks/UpgradeTasks";

import C "../../common/Constants";
import E "../../common/Errors";

import ACORNInterface "../../core/acorn/Interface";
import ICPUSDInterface "../../core/icpusd/Interface";
import TreasuryInterface "../../core/treasury/Interface";
import SplitInterface "../../core/split/Interface";
import AffiliateInterface "../../core/affiliate/Interface";
import EscrowInterface "../../core/escrow/Interface";
import SalesInterface "../../core/sales/Interface";
import AxiomsInterface "../../core/axioms/Interface";
import DAOInterface "../../periphery/dao/Interface";
import FacadeInterface "../../periphery/facade/Interface";

import Base "../../library/Base";
import BlobCommitment "../../library/BlobCommitment";
import Configs "../../library/Configs";
import Date "../../library/Date";
import Hexadecimal "../../library/Hexadecimal";
import Iter "../../library/Iter";
import Management "../../library/Management";
import Map "../../library/Map";
import Version "../../library/Version";

import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import List "mo:base/List";
import ExperimentalCycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import Debug "mo:base/Debug";
import Timer "mo:base/Timer";
import Int "mo:base/Int";

shared ({ caller = founder }) persistent actor class Indicator() = this {
    ////// TEMPORARY IMPLEMENTATION ////////////
    private stable var shiftedTime : Int = 0;
    private func getNow() : Int = shiftedTime + Time.now();
    public query func getCanisterTime() : async Int { getNow() };
    public shared func shiftToMidnight(days : Nat) : async () {
        for (i in Iter.range(1, days)) {
            shiftedTime += C.ONE_DAY - getNow() % C.ONE_DAY;
            await _dailyExecution()
        };
        for (actorVariant in [#Affiliate, #Axioms, #DAO, #Escrow, #Facade, #Split].vals()) {
            let id : Text = Principal.toText(Actors.getPrincipal(actors, actorVariant));
            let actorInstance : AffiliateInterface.Affiliate or AxiomsInterface.Axioms or DAOInterface.DAO or EscrowInterface.Escrow or FacadeInterface.Facade or SplitInterface.Split = actor (id);
            await actorInstance.shiftToMidnight(days)
        }
    };
    public shared ({ caller }) func addController() : async () {
        await expectAuthorized(caller, [#Founder]);

        let settings : Management.Settings = {
            controllers = ?[Principal.fromActor(this), caller];
            compute_allocation = null;
            memory_allocation = null;
            freezing_threshold = null
        };
        for (actorVariant in [#ACORN, #ICPUSD, #Treasury, #Split, #Affiliate, #Escrow, #Sales, #Axioms, #DAO, #Facade].vals()) {
            ExperimentalCycles.add<system>(1_000_000_000_000);
            await Management.IC0.update_settings({
                canister_id = Actors.getPrincipal(actors, actorVariant);
                settings
            });
            Debug.print(debug_show (actorVariant, settings))
        }
    };
    ////// TEMPORARY IMPLEMENTATION ////////////

    private stable var version : Version.Version = Version.new();
    private stable let actors : Actors.Actors = Actors.init(founder);
    private stable let installations : Installations.Installations = Installations.init();
    private stable let upgradeTasks : UpgradeTasks.UpgradeTasks = Map.new();

    private stable let configs : Configs.Configs = Configs.make([
        ("CODE_UPLOAD_SESSION_AVAILABILITY_DURATION", #Duration(2)),
    ]);

    /// PRIVATE ////// MODIFIERS ////////////

    private func _executeUpgradeTasks() : async () {
        let daoId : Text = Principal.toText(Actors.getPrincipal(actors, #DAO));
        let DAO : DAOInterface.DAO = actor (daoId);

        for ((proposalId, (issuer, actorsConfigs)) in UpgradeTasks.tasks(upgradeTasks)) {
            try {
                await putActorsConfigs(actorsConfigs);
                await _upgradeCanisters(issuer);
                await DAO.setCodeProposalExecuted(proposalId)
            } catch (error) {
                await DAO.setCodeProposalFailed(proposalId, Error.message(error))
            }
        };
        UpgradeTasks.clear(upgradeTasks)
    };
    private func _executeCleanUpExpiredInstallations() {
        Installations.cleanUpExpiredInstallations(installations, getNow)
    };

    private func _dailyExecution() : async () {
        await _executeUpgradeTasks();
        _executeCleanUpExpiredInstallations()
    };

    private func _installCode(actorVariant : Actor.Variant, commitment : Commitment.Commitment, commitHash : Text, mode : Management.InstallMode) : async () {
        let moduleBytes : [Nat8] = BlobCommitment.getBytes(commitment.wasmCommitment);
        let actorData : Actor.Actor = Actors.getActor(actors, actorVariant);
        let installCodeArgs : Management.InstallCodeArgs = Actor.constructInstallCodeArgs(actorData, commitment.args, moduleBytes, mode);
        await Management.IC0.install_code(installCodeArgs);
        Actor.update(actorData, commitment.args, commitHash)
    };
    private func _installCanisters() : async () {
        let { commitments; updateLevel; commitHash } : Installation.Installation = Installations.installation(installations, founder);
        for ((actorVariant, commitment) in Map.entries(commitments)) {
            await _installCode(actorVariant, commitment, commitHash, #install)
        };
        for (actorVariant in [#Affiliate, #Axioms, #DAO, #Escrow, #Facade].vals()) {
            let id : Text = Principal.toText(Actors.getPrincipal(actors, actorVariant));
            let actorInstance : AffiliateInterface.Affiliate or AxiomsInterface.Axioms or DAOInterface.DAO or EscrowInterface.Escrow or FacadeInterface.Facade = actor (id);
            await actorInstance.initialize()
        };
        Version.increase(version, updateLevel);
        Installations.remove(installations, founder)
    };
    private func _upgradeCanisters(issuer : Principal) : async () {
        let { commitments; updateLevel; commitHash } : Installation.Installation = Installations.installation(installations, issuer);
        for ((actorVariant, commitment) in Map.entries(commitments)) {
            await _installCode(actorVariant, commitment, commitHash, #upgrade)
        };
        Version.increase(version, updateLevel);
        Installations.remove(installations, issuer)
    };

    /// PROTECTED ////// MODIFIERS ////////////

    public shared ({ caller }) func initialize() : async () {
        await expectAuthorized(caller, [#Founder]);
        await expectUnreleased();

        let defaultSettings : ?Management.Settings = ?{
            controllers = ?[Principal.fromActor(this)];
            compute_allocation = null;
            memory_allocation = null;
            freezing_threshold = null
        };
        let frontendSettings : ?Management.Settings = ?{
            controllers = ?[Principal.fromActor(this), caller];
            compute_allocation = null;
            memory_allocation = null;
            freezing_threshold = null
        };
        for (actorVariant in [#ACORN, #ICPUSD, #Treasury, #Split, #Affiliate, #Escrow, #Sales, #Axioms, #DAO, #Facade, #Frontend].vals()) {
            let settings : ?Management.Settings = switch (actorVariant) {
                case (#Frontend) frontendSettings;
                case (_) defaultSettings
            };
            ExperimentalCycles.add<system>(1_000_000_000_000);
            let { canister_id } : Management.CreateCanisterResult = await Management.IC0.create_canister({
                settings
            });
            Actors.initializeActor(actors, actorVariant, canister_id)
        };
        Actors.initializeActor(actors, #Indicator, Principal.fromActor(this))
    };
    public shared ({ caller }) func setConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await expectAuthorized(caller, [#Indicator]);
        Configs.setBatch(configs, entries)
    };
    public shared ({ caller }) func putConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await expectAuthorized(caller, [#Indicator]);
        Configs.putBatch(configs, entries)
    };

    public shared ({ caller }) func setActorsConfigs(actorsConfigs : Installation.ActorsConfigs) : async () {
        await expectAuthorized(caller, [#DAO, #Indicator]);
        for ((actorVariant, configs) in actorsConfigs.vals()) {
            let id : Text = Principal.toText(Actors.getPrincipal(actors, actorVariant));
            let actorInstance : AffiliateInterface.Affiliate or AxiomsInterface.Axioms or EscrowInterface.Escrow or SalesInterface.Sales or DAOInterface.DAO or FacadeInterface.Facade = actor (id);
            await actorInstance.setConfigs(configs)
        }
    };
    public shared ({ caller }) func putActorsConfigs(actorsConfigs : Installation.ActorsConfigs) : async () {
        await expectAuthorized(caller, [#DAO, #Indicator]);
        for ((actorVariant, configs) in actorsConfigs.vals()) {
            let id : Text = Principal.toText(Actors.getPrincipal(actors, actorVariant));
            let actorInstance : AffiliateInterface.Affiliate or AxiomsInterface.Axioms or EscrowInterface.Escrow or SalesInterface.Sales or DAOInterface.DAO or FacadeInterface.Facade = actor (id);
            await actorInstance.putConfigs(configs)
        }
    };

    public shared ({ caller }) func initializeFirstSession(updateLevel : Version.UpdateLevel, releaseNotes : Installation.ReleaseNotes, commitments : Commitments.Sharable) : async () {
        await expectAuthorized(caller, [#Founder]);
        await expectUnreleased();
        let CODE_UPLOAD_SESSION_AVAILABILITY_DURATION : Nat = Configs.Duration(configs, "CODE_UPLOAD_SESSION_AVAILABILITY_DURATION");
        let expiryDate : Int = Date.getNextDays(getNow(), CODE_UPLOAD_SESSION_AVAILABILITY_DURATION - 1); // ensure expire at duration-th midnight
        Installations.add(installations, founder, "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", updateLevel, releaseNotes, commitments, expiryDate)
    };
    public shared ({ caller }) func initializeSession(issuer : Principal, commitHash : Text, updateLevel : Version.UpdateLevel, releaseNotes : Installation.ReleaseNotes, commitments : Commitments.Sharable) : async () {
        await expectAuthorized(caller, [#DAO]);
        for ({ actorVariant } in commitments.vals()) {
            if (actorVariant == #ACORN) E.f(#NOT_VALID("Commitments"), "ACORN cannot be included in the commitments")
        };
        let CODE_UPLOAD_SESSION_AVAILABILITY_DURATION : Nat = Configs.Duration(configs, "CODE_UPLOAD_SESSION_AVAILABILITY_DURATION");
        let expiryDate : Int = Date.getNextDays(getNow(), CODE_UPLOAD_SESSION_AVAILABILITY_DURATION - 1); // ensure expire at duration-th midnight
        Installations.add(installations, issuer, commitHash, updateLevel, releaseNotes, commitments, expiryDate)
    };
    public shared ({ caller }) func deleteSession(issuer : Principal) : async () {
        await expectAuthorized(caller, [#DAO]);
        Installations.expectFound(installations, issuer);
        Installations.remove(installations, issuer)
    };

    public shared ({ caller }) func installCanisters() : async () {
        await expectAuthorized(caller, [#Founder]);
        await expectUnreleased();
        await _installCanisters()
    };
    public shared ({ caller }) func enqueueUpgradeTask(proposalId : Nat, issuer : Principal, actorsConfigs : Installation.ActorsConfigs) : async () {
        await expectAuthorized(caller, [#DAO]);
        UpgradeTasks.add(upgradeTasks, proposalId, issuer, actorsConfigs)
    };
    public shared ({ caller }) func extendInstallationExpiryDate(issuer : Principal, duration : Nat) : async () {
        await expectAuthorized(caller, [#DAO]);
        let expiryDate : Int = Date.getNextDays(getNow(), duration - 1); // ensure expire at duration-th midnight
        Installations.extendAvailabilityDuration(installations, issuer, expiryDate)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public shared ({ caller }) func topUp(actorVariant : Actor.Variant, amount : Nat) : async () {
        await expectAuthorized(caller, [#Founder]);
        let canister_id : Principal = Actors.getPrincipal(actors, actorVariant);
        ExperimentalCycles.add<system>(amount);
        await Management.IC0.deposit_cycles({ canister_id })
    };

    public shared ({ caller }) func uploadCommitmentChunk(actorVariant : Actor.DeployableVariant, id : Nat8, chunk : Blob, expectedModuleHash : Text) : async () {
        let { commitments } : Installation.Installation = Installations.installation(installations, caller);
        let commitment : Commitment.Commitment = Commitments.commitment(commitments, actorVariant);
        Commitment.uploadChunk(commitment, id, chunk, expectedModuleHash)
    };
    public shared ({ caller }) func settleCommitment(actorVariant : Actor.DeployableVariant) : async () {
        let { commitments } : Installation.Installation = Installations.installation(installations, caller);
        let commitment : Commitment.Commitment = Commitments.commitment(commitments, actorVariant);
        Commitment.settle(commitment)
    };
    public shared ({ caller }) func clearCommitment(actorVariant : Actor.DeployableVariant) : async () {
        let { commitments } : Installation.Installation = Installations.installation(installations, caller);
        let commitment : Commitment.Commitment = Commitments.commitment(commitments, actorVariant);
        Commitment.clear(commitment)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public shared func getActorInfo(actorVariant : Actor.Variant) : async Actor.Info {
        let actorData : Actor.Actor = Actors.getActor(actors, actorVariant);
        let canisterStatus : Management.CanisterStatusResult = await Management.IC0.canister_status({
            canister_id = actorData.principal
        });
        let actorInfo : Actor.Info = {
            status = canisterStatus.status;
            memorySize = canisterStatus.memory_size;
            cycles = canisterStatus.cycles;
            args = actorData.args;
            moduleHash = Hexadecimal.encode(Base.unwrap(canisterStatus.module_hash));
            commitHash = actorData.commitHash
        };
        actorInfo
    };
    public shared func getActorsInfo() : async [(Actor.Variant, Actor.Info)] {
        var actorsInfo : List.List<(Actor.Variant, Actor.Info)> = List.nil();
        for ((actorName, actorData) in Actors.actors(actors)) {
            let canisterStatus : Management.CanisterStatusResult = await Management.IC0.canister_status({
                canister_id = actorData.principal
            });
            let actorInfo : Actor.Info = {
                status = canisterStatus.status;
                memorySize = canisterStatus.memory_size;
                cycles = canisterStatus.cycles;
                args = actorData.args;
                moduleHash = Hexadecimal.encode(Base.unwrap(canisterStatus.module_hash));
                commitHash = actorData.commitHash
            };
            actorsInfo := List.push((actorName, actorInfo), actorsInfo)
        };
        List.toArray(actorsInfo)
    };
    public query func getInstallation(issuer : Principal) : async Installation.Sharable {
        Installations.getInstallation(installations, issuer)
    };
    public query func getInstallationWithTitle(issuer : Principal) : async (Installation.Sharable, Text) {
        let installation : Installation.Sharable = Installations.getInstallation(installations, issuer);
        let title : Text = "Migrate " # Version.toSharable(version) # " -> " # Version.getIncrement(version, installation.updateLevel) # " with " # Nat.toText(installation.commitments.size()) # " Actors affected";
        (installation, title)
    };

    public query func getCommitmentUploadedChunks(issuer : Principal, actorVariant : Actor.DeployableVariant) : async [Nat8] {
        let { commitments } : Installation.Installation = Installations.installation(installations, issuer);
        let commitment : Commitment.Commitment = Commitments.commitment(commitments, actorVariant);
        Commitment.getUploadedChunks(commitment)
    };
    public query func getCommitmentComputedModuleHash(issuer : Principal, actorVariant : Actor.DeployableVariant) : async Text {
        let { commitments } : Installation.Installation = Installations.installation(installations, issuer);
        let commitment : Commitment.Commitment = Commitments.commitment(commitments, actorVariant);
        Commitment.getComputedModuleHash(commitment)
    };
    public query func checkInstallationSettled(issuer : Principal) : async Bool {
        let { commitments } : Installation.Installation = Installations.installation(installations, issuer);
        Commitments.isSettled(commitments)
    };

    public query func getVersion() : async Version.Sharable {
        Version.toSharable(version)
    };
    public query func getVariant(principal : Principal) : async Actor.Variant {
        Actors.getVariant(actors, principal)
    };
    public query func getPrincipal(name : Actor.Variant) : async Principal {
        Actors.getPrincipal(actors, name)
    };
    public query func getPrincipals() : async [(Actor.Variant, Principal)] {
        Actors.getPrincipals(actors)
    };

    /// PUBLIC ////// ASSERTORS ////////////

    public query func getConfig(key : Configs.Key) : async Configs.SharableValue {
        Configs.getConfig(configs, key)
    };
    public query func getConfigs() : async Configs.Sharable {
        Configs.getConfigs(configs)
    };

    public query func expectAuthorized(caller : Principal, toBe : [Actor.Variant]) : async () {
        Actors.expectAuthorized(actors, caller, toBe)
    };
    public query func expectUnreleased() : async () {
        Version.expectPreRelease(version)
    };

    /// PUBLIC ////// ACTORS ////////////

    public query func ACORN() : async ACORNInterface.ACORN {
        let acornId : Text = Principal.toText(Actors.getPrincipal(actors, #ACORN));
        actor (acornId)
    };
    public query func ICPUSD() : async ICPUSDInterface.ICPUSD {
        let icpusdId : Text = Principal.toText(Actors.getPrincipal(actors, #ICPUSD));
        actor (icpusdId)
    };
    public query func Treasury() : async TreasuryInterface.Treasury {
        let treasuryId : Text = Principal.toText(Actors.getPrincipal(actors, #Treasury));
        actor (treasuryId)
    };
    public query func Split() : async SplitInterface.Split {
        let splitId : Text = Principal.toText(Actors.getPrincipal(actors, #Split));
        actor (splitId)
    };
    public query func Affiliate() : async AffiliateInterface.Affiliate {
        let affiliateId : Text = Principal.toText(Actors.getPrincipal(actors, #Affiliate));
        actor (affiliateId)
    };
    public query func Escrow() : async EscrowInterface.Escrow {
        let escrowId : Text = Principal.toText(Actors.getPrincipal(actors, #Escrow));
        actor (escrowId)
    };
    public query func Sales() : async SalesInterface.Sales {
        let salesId : Text = Principal.toText(Actors.getPrincipal(actors, #Sales));
        actor (salesId)
    };
    public query func Axioms() : async AxiomsInterface.Axioms {
        let hypothesesId : Text = Principal.toText(Actors.getPrincipal(actors, #Axioms));
        actor (hypothesesId)
    };
    public query func DAO() : async DAOInterface.DAO {
        let daoId : Text = Principal.toText(Actors.getPrincipal(actors, #DAO));
        actor (daoId)
    };
    public query func Facade() : async FacadeInterface.Facade {
        let facadeId : Text = Principal.toText(Actors.getPrincipal(actors, #Facade));
        actor (facadeId)
    };

    /// PRIVATE ////// CRON JOBS ////////////

    ignore Timer.setTimer<system>(
        /// 0:05:00 UTC
        #nanoseconds((C.ONE_DAY + (5 * C.ONE_MINUTE) - (Int.abs(Time.now()) % C.ONE_DAY)) % C.ONE_DAY),
        func() : async () {
            await _dailyExecution();
            ignore Timer.recurringTimer<system>(#nanoseconds(C.ONE_DAY), _dailyExecution)
        },
    )
}
