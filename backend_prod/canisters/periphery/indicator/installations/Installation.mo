import Actor "../actors/Actor";
import Commitment "../commitments/Commitment";
import Commitments "../commitments/Commitments";

import Configs "../../../library/Configs";
import Version "../../../library/Version";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type UpdateLevel = Version.UpdateLevel;
    private type SharableConfigs = Configs.Sharable;

    private type ConfigurableActorVariant = Actor.ConfigurableVariant;
    private type Commitment = Commitment.Commitment;
    private type SharableCommitment = Commitment.Sharable;
    private type Commitments = Commitments.Commitments;
    private type SharableCommitments = Commitments.Sharable;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Changes = {
        #Added : [Text];
        #Changed : [Text];
        #Removed : [Text];
        #Fixed : [Text];
        #Security : [Text]
    };
    public type ReleaseNotes = [Changes];
    public type ActorsConfigs = [(ConfigurableActorVariant, SharableConfigs)];

    /// INDICATOR ////// INSTALLATION ////////////

    private type Self = Installation;

    public type Installation = {
        commitments : Commitments;
        commitHash : Text;
        updateLevel : UpdateLevel;
        releaseNotes : ReleaseNotes
    };
    public type Sharable = {
        commitments : SharableCommitments;
        commitHash : Text;
        updateLevel : UpdateLevel;
        releaseNotes : ReleaseNotes
    };

    public func init(commitHash : Text, updateLevel : UpdateLevel, releaseNotes : ReleaseNotes, commitments : SharableCommitments) : Self = {
        commitHash;
        updateLevel;
        releaseNotes;
        commitments = Commitments.init(commitments)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func toSharable(__ : Self) : Sharable = {
        __ with commitments = Commitments.getCommitments(__.commitments)
    }
}
