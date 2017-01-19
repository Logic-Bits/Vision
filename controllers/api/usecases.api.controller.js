var config = require('config.json');
var express = require('express');
var router = express.Router();
var ucService = require('services/usecase.db.service');

// routes
router.post('/create', createUseCase);
//router.get('/current', getCurrentUser);
router.put('/:_id', updateUseCase);
router.get('/:_id', getUseCase);
router.get('/', getUseCases);
router.get('/FunctionSpezifications/:_id', getFunctionSpezifications);
router.get('/duplicate/:_id', duplicateUseCase);
router.delete('/:_id', deleteUseCase);
router.delete('/deleteall/:_id', deleteAllUseCases);

module.exports = router;

function createUseCase(req, res) {
    ucService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getUseCase(req, res) {
    ucService.getById(req.params._id)
        .then(function (uc) {
            if (uc) {
                res.send(uc);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getUseCases(req, res) {

    ucService.getAll()
        .then(function (uc) {

            if (uc) {
                //console.log("result ok");
                res.send(uc);
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

function getFunctionSpezifications(req, res) {
    ucService.getFSs(req.params._id)
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

function deleteUseCase(req, res) {
    var userId = req.user.sub;
    var ucId = req.params._id;

    // if (req.params._id !== userId) {
    //     // can only delete own account
    //     return res.status(401).send('You can only delete your own account');
    // }

    ucService.delete(ucId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function duplicateUseCase(req, res) {
    ucService.duplicate(req.params._id).then(function (uc) {

        if (uc) {
            res.send(uc);
        } else {
            res.sendStatus(404);
        }
    });
}

// function deleteUseCase(req, res) {
//     var userId = req.user.sub;
//     var ucId = req.params._id;
//
//     // if (req.params._id !== userId) {
//     //     // can only delete own account
//     //     return res.status(401).send('You can only delete your own account');
//     // }
//
//     ucService.delete(ucId)
//         .then(function () {
//             res.sendStatus(200);
//         })
//         .catch(function (err) {
//             res.status(400).send(err);
//         });
// }

function updateUseCase(req, res) {
    var userId = req.params._id;

    ucService.update(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteAllUseCases(req, res) {

    var userId = req.user.sub;
    var ucId = req.params._id;

    console.log("User " + userId + " deleted all Usecases");

    ucService.deleteAllUseCases(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}