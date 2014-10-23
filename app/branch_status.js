var request = require('request');

function BranchStatus(db) {
  this._db = db;
}

BranchStatus.prototype = {

  sync : function() {
    request('http://jenkinstein.herokuapp.com/branches.json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var branches = JSON.parse(body);
        
        // walk the DB, look up the status in the branches JSON and update the DB
        var trackedBranches = this._db.trackedBranches();
        trackedBranches.forEach(function(branch) {
          console.log("looking at " + branch.name);
          
          var info = branches[branch.name];
          
          if (info) {
            console.log(info);
            this._db.updateTrackedBranch(branch.name, { name : branch.name, status : info.green ? 'success' : 'failed', lastBuild : { time : info.last_built, url : info.url, sha : info.sha } });
          }
          else {
            console.log("Warning: did not find branch '" + branch.name + "' in server status JSON");
          }
        }, this);
        
        console.log("Sync done.");
      }
      else {
        console.log("SYNC ERROR with branch status server");
        console.log(error);
        console.log(response.statusCode);
      }
    }.bind(this));
  }

};

module.exports = BranchStatus;