module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg","Please log in to view this resource");
    res.redirect("signin");
  }
}

// module.exports = {
//   ensureAuthenticated: function(req, res, next) {
//     if(req.isAuthenticated()) {
//       if(req.body.username === "ajit@gmail.com") {
//         return res.render("adminprofile");
//       } else {
//         return res.render("profile");
//       }
//     }
//     req.flash("error_msg","Please log in to view this resource");
//     res.redirect("signin");
//     next();
//   }
//
// }
