import Map "../../library/Map";
import Earning "../../library/Earning";
import Set "../../library/Set";
import List "../../library/List";
import Users "users/Users";
import Flags "flags/Flags";
import User "users/User";
import TernaryVotes "../../library/votes/TernaryVotes";
import BinaryVotes "../../library/votes/BinaryVotes";
import Flag "flags/Flag";
import Time "mo:base/Time";

module {
    public func migration(
        old : {
            var flags : {
                requests : Map.Map<Flag.Header, { requester : Principal; requestDate : Time.Time; votes : BinaryVotes.Votes; reason : Text; var status : { #Requested; #Approved; #Rejected; #Expired; #Executed; #Failed } }>;
                var requesting : List.List<Flag.Header>
            }
        }
    ) : {
        var flags : Flags.Flags
    } {
        {
            var flags : Flags.Flags = do {
                var newRequests = Map.new<Flag.Header, Flag.Flag>();

                for ((header, oldRequest) in Map.entries(old.flags.requests)) {
                    let newRequest : Flag.Flag = {
                        oldRequest with var status = switch (oldRequest.status) {
                            case (#Executed) #Approved;
                            case (#Failed) #Rejected;
                            case (#Requested) #Requested;
                            case (#Approved) #Approved;
                            case (#Rejected) #Rejected;
                            case (#Expired) #Expired
                        }
                    };
                    Map.put(newRequests, Flag.Key(header), newRequest)
                };
                { requests = newRequests; var requesting = old.flags.requesting }
            }
        }
    }
}
