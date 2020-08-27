const passport = require('passport');
const GoogleStratergy = require('passport-google-oauth').OAuth2Strategy;
const { userSchema } = require('../models/user.model');

const googlePassportStratergy = () => {
    passport.use(new GoogleStratergy({
            clientID: '',
            clientSecret: '',
            // callbackURL: 'https://packurbags.herokuapp.com/api/v1/auth/passport/google/generateToken'
            callbackURL: 'http://localhost:3000/api/v1/auth/passport/google/generateToken'
        },
        async(accessToken, refreshtoken, profile, done) => {
            const userEmail = profile.emails[0].value;
            const userData = new userSchema.findOne({
                email: userEmail
            });
            if (userData) {
                const userLoginData = await userData.generateAuthToken();
                if (userLoginData) {
                    userData.tokens = userData.tokens.push(userLoginData.token);
                    userData.save();
                    return done(null, userData);
                }
            } else {
                console.log('google profile', profile);
                const newUser = new userSchema({});
                const displayName = profile.displayName.split(' ');
                newUser.email = profile.emails[0].value;
                newUser.firstName = displayName[0];
                newUser.lastName = displayName[1];
                newUser.mobileNumber = profile.mobileNumber[1];
                newUser.tokens = newUser.tokens.push(accessToken);
                const userData = await newUser.save();
                if (!userData) {
                    done('User account cannot be created. Failed at Passport Signup level.');
                } else {
                    const userFirstName = newUser.firstName;
                    const userPhNum = newUser.mobileNumber;
                    try {
                        const options = {
                            'method': 'POST',
                            'url': 'https://rest-api.d7networks.com/secure/send',
                            'headers': {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Authorization': 'Basic eXhpYzY2Nzc6NmhIWW5PbFc' // ? dup
                                    // 'Authorization': 'Basic eXhpYzY2Nzc6NmhIWW5PbFc=' // ? original
                            },
                            body: `{
                            "to": "+91${userPhNum}",
                            "from": "PUBSMS",
                            "content": "Hi ${userFirstName}\nWelcome to Pack Ur Bags. Your Account with a first name: ${userFirstName} is created Successfully.\nNow you can browse through your desired flights and can add them to you journey favourites list. Please verify your mobile number as soon as possible so that you can also get the access for booking tickets for any journey.",
                            "dlr": "yes",
                            "dlr-level": "3",
                            "dlr-url": "https://packurbags.pavanaditya.com"
                        }`
                        };

                        request(options, function(error, response) {
                            if (error) {
                                done('User account created. SMS sending failed at d7networks server level for Google signup.', userData);
                            } else {
                                done(null, userData);
                            }
                        });
                    } catch (err) {
                        done('User account created. SMS sending failed at pack ur bags server level for Google signup.', userData);
                    }
                }
                done(null, userData);
            }
        }
    ));
}

module.exports = {
    googlePassportStratergy: googlePassportStratergy
};