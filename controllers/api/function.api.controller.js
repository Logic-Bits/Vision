var config = require('config.json');
var express = require('express');
var router = express.Router();
var fService = require('services/function.db.service');

// routes
router.post('/create', create);
//router.get('/current', getCurrentUser);
router.put('/:_id', update);
router.get('/:_id', getSingle);
router.get('/', get);
router.delete('/:_id', deleteSingle);
router.delete('/deleteall/:_id', deleteAll);

module.exports = router;

function create(req, res) {
    fService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getSingle(req, res) {
    fService.getById(req.params._id)
        .then(function (fs) {
            if (fs) {
                res.send(fs);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function get(req, res) {


  fService.getAll()
      .then(function (fs) {

          if (fs) {
              //console.log("result ok");
              res.send(fs);
          } else {
              //console.log("result not ok");
              res.sendStatus(404);
          }
      })
      .catch(function (err) {

          console.log("catch ");
          res.status(400).send(err);
      });
}

function deleteSingle(req, res) {
    var userId = req.user.sub;
    var fsId = req.params._id;

    // if (req.params._id !== userId) {
    //     // can only delete own account
    //     return res.status(401).send('You can only delete your own account');
    // }

    fService.delete(fsId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

// function deleteUseCase(req, res) {
//     var userId = req.user.sub;
//     var fsId = req.params._id;
//
//     // if (req.params._id !== userId) {
//     //     // can only delete own account
//     //     return res.status(401).send('You can only delete your own account');
//     // }
//
//     fService.delete(fsId)
//         .then(function () {
//             res.sendStatus(200);
//         })
//         .catch(function (err) {
//             res.status(400).send(err);
//         });
// }

function update(req, res) {
    var userId = req.params._id;

    fService.update(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteAll(req, res) {

      var userId = req.user.sub;
      var fsId = req.params._id;

      console.log("User "+ userId+" deleted all Function Spezifications");

      fService.deleteAllUseCases(userId)
          .then(function () {
              res.sendStatus(200);
          })
          .catch(function (err) {
              res.status(400).send(err);
          });
}
