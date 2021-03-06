const jwt = require('jsonwebtoken');

const secret = 'H3llow0r!d';
const expiration = '2h';

module.exports = {
  signToken: function({ displayName, email, _id }) {
    const payload = { displayName, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
  authMiddleware: function({ req }) {
    // allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;
  
    // separate "Bearer" from "<tokenvalue>"
    if (req.headers.authorization) {
      token = token
        .split(' ')
        .pop()
        .trim();
    }
  
    // if no token, return request object as is
    if (!token) {
      return req;
    }
  
    try {
      // decode and attach user data to request object
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
    }
  
    // return updated request object
    return req;
  }
,



authToken :function (tokenString) {
  // allows token to be sent via req.body, req.query, or headers
  console.log("we came to decode token String");
  // separate "Bearer" from "<tokenvalue>"
    let token = tokenString
      .split(' ')
      .pop()
      .trim();
  // if no token, return request object as is
  if (!token) {
    return false;
  }
  try {
    console.log("decoding")
    // decode and attach user data to request object
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    console.log("The data we are returning");
    console.log(data);
    return data;
  } catch {
    console.log('Invalid token');
    return false;
  }

  // return updated request object

}

};