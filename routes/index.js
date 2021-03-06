const router = require('express').Router()
const User = require('../models/User')
const uploadCloud = require('../handlers/cloudinary')
const {isLogged} = require('../handlers/middlewares')

router.get('/', (req, res, next) => {
  res.render('index')
})

router.get('/editProfile/:id', isLogged, (req, res, next) => {
  const { id } = req.params
  User.findById(id)
    .then(user => {
      res.render('editProfile', {user})
    })
    .catch(err => res.send(err))
})

router.post('/editProfile/:id', isLogged, uploadCloud.single('profileImg'), (req, res, next) => {
    const { id } = req.params
    const correctLink = url => url.includes('https://') ? url : 'https://' + url 
    const { username, name, age, currentJob, twitter, linkedin, github, facebook, codewars, instagram } = req.body
    User.findByIdAndUpdate(id, { $set: {username, name, age, currentJob, twitter: correctLink(twitter), linkedin: correctLink(linkedin), github: correctLink(github), facebook: correctLink(facebook), codewars: correctLink(codewars), instagram: correctLink(instagram), profileImg: req.file ? req.file.secure_url : '' } }, { new: true })
      .then(user => {
      return res.redirect(`/profile/${user._id}`)
      })
      .catch(err => res.send(err))
  })

router.get('/profile/:id', isLogged, (req, res, next) => {
  const { id } = req.params
  const userID = req.user._id
  let editPermision = false
  let admin = false
  User.findById(id)
    .then(user => {
      if(userID == id){ 
        editPermision = true
     }  
     if(req.user.role == 'ADMIN'){
       admin = true
     }
     user.admin = admin
     user.editPermision = editPermision
     res.render('profile', {user})
    })
    .catch(err => res.send(err))
})

router.get('/:id/delete', isLogged, (req, res, next) => {
  const { id } = req.params
  User.findByIdAndRemove(id)
  .then((user) => {
    user.id = id
    res.redirect('/auth/signup')
  })
  .catch(err => res.send(err))
})

module.exports = router
