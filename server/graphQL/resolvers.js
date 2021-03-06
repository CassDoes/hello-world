const registrations = require("../userAuthentication/registration/userRegistration");
const { User, Project, Donation } = require("../models");
const { signToken, authToken } = require("../utils/auth");
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

// var validator = require("is-my-json-valid");
const resolvers = {
  Query: {
    users: async () => {
      return User.find()
        .select("-__v -password")
        .populate("friends")
        .populate("blockedUsers")
        .populate("projects")
        .populate("savedProjects")
        .populate("skills")
        .populate("socialLinks");
    },
    user: async (parent, args) => {
      const { email } = args;
      console.log(email);
      const user = await User.findOne({ email: email })
        .select("-__v -password")
        .populate("friends")
        .populate("blockedUsers")
        .populate("projects")
        .populate("savedProjects")
        .populate("skills")
        .populate("socialLinks");
      console.log(user);
      return user;
    },
    userFromToken : async(parent, args) => {
      const {idtoken} = args;
      console.log("we are in resolvers");
      const user = authToken(idtoken);
      const token = signToken(user);
      console.log("what we are returning here as token : ");
      console.log(token);
      console.log("what we are returning here as user: ");
      console.log(user)
      return {token, user}
    },
    project: async (parent, args) => {
      const { projectID } = args;
      const project = await Project.findOne({ _ID: projectID })
        .select("-__v")
        .populate("createdBy")
        .populate("colloborators");
      return project;
    },
    projects: async () => {
      const project = await Project.find()
        .select("-__v")
        .populate("createdBy")
        .populate("colloborators");
      return project;
    },
    skillProjects: async (parent, args) => {
      const {skills} = args;
      const project = await Project.find({skillsRequiredForHelp:  {$in : [...skills] } } )
        .select("-__v")
        .populate("createdBy")
        .populate("colloborators");
        console.log(project);
      return project;
    },
    checkout: async (parent, args, context) => {
      const url = new URL(context.headers.referer).orgin;
      const donation = new Donation ({ donations: args.donations });
      const line_itmes = [];

      const { donations } = await donation.populate('users');

      for(let i = 0; i < donations.length; i++) {
        const donation = await stripe.products.create({
          name: user[i].name
        });

        const price = await stripe.prices.create({
          user: user.id,
          unit_amount: donations[i].price * 100,
          currency: 'usd',
        });

        line-items.push({
          price: price.id,
          quantity: 1
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url}/`
      });

      return { session: session.id };
    }

  },
  Mutation: {
    addLocalUser: async (parent, args) => {
      const { displayName, email, password } = args;
      const user = await registrations.createLocalUser(
        displayName,
        email,
        password
      );
      //create a common function to pass user object and get back the JWTToken along with User
      const token = signToken(user);
      return { token, user };
    },

    addFBUser: async (parent, args) => {
      const { displayName, email } = args;
      const user = await registrations.createFBUser(displayName, email);
      const token = signToken(user);
      return { token, user };
    },
    addGoogleUser: async (parent, args) => {
      const { displayName, email } = args;
      const user = await registrations.createGoogleUser(displayName, email);
      const token = signToken(user);
      return { token, user };
    },
    addGitHubUser: async (parent, args) => {
      const { displayName, email } = args;
      const user = await registrations.createGHUser(displayName, email);
      const token = signToken(user);
      return { token, user };
    },
    addLinkedInUser: async (parent, args) => {
      const { displayName, email } = args;
      const user = await registrations.createLINUser(displayName, email);
      const token = signToken(user);
      return { token, user };
    },

    login: async (parent, args) => {
      const { email, password } = args;
      const user = await User.findOne({ email })
        .select("-__v")
        .populate("friends")
        .populate("blockedUsers")
        .populate("projects")
        .populate("savedProjects")
        .populate("skills")
        .populate("socialLinks");
      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const token = signToken(user);
      return { token, user };
    },

    // Mutation for adding a Project

    addProject: async (parent, args) => {
      const {
        title,
        description,
        content,
        createdBy,
        skillsRequired,
        colloborators,
        helpRequired,
      } = args;
      const newProject = await Project.create({
        title: title,
        description: description,
        content: content,
        createdBy: createdBy,
        skillsRequiredForHelp: [...skillsRequired],
        colloborators: colloborators,
        helpRequired: helpRequired,
        createdAt: Date.now(),
      });
      console.log(newProject);
      
      if(!newProject){
        return "";
      }
      //updating own project
      await User.findByIdAndUpdate(
        { _id: createdBy },
        { $push: { projects: newProject._id } },
        { new: true }
      );
      if(colloborators){
      colloborators.map(async (colloborator) => {
        if(colloborator != createdBy ){
        await User.findByIdAndUpdate(
          { _id: colloborator },
          { $push: { projects: newProject._id } },
          { new: true }
        );
        }
      });
    }
      // Need to update colloborations
      const updatedProject = await Project.findOne({_id: newProject._id})
        .select("-__v")
        .populate("createdBy")
        .populate("colloborators");
      return updatedProject;
    },
    updateUserProfile: async (parent, args) => {
      const { userData } = args;
      const inputUser = formatInputUserData(userData);
      const userID = inputUser._id;
      delete inputUser._id;
      console.log(inputUser);
      return await User.findOneAndUpdate({_id:userID},inputUser, {new: true});
    },
    updateProject : async(parent, args) => {
        const {projectData} = args;
        const inputProjectData = formatInputProjectData(projectData);
        const projectID = inputProjectData._id;
        delete inputProjectData._id;
        console.log(inputProjectData);
        console.log(projectID);
        return await Project.findOneAndUpdate({_id: projectID},inputProjectData, {
          new: true});
    }
  },
};

// A helper funciton to validate input peojct JSON to a project model object
const formatInputUserData = (inputData) => {
  const user = {};
  // Assuming the input data is a VALID JSON
  if (typeof inputData == "string") {
    const JSONInput = JSON.parse(inputData);
    if (JSONInput._id) {
      user["_id"] = JSONInput._id;
    }
    if (JSONInput.displayName) {
      user["displayName"] = JSONInput.displayName;
    }
    if (JSONInput.email) {
      user["email"] = JSONInput.email;
    }
    if (JSONInput.friends) {
      if (JSONInput.friends.length > 0) {
        user["friends"] = JSONInput.friends;
      }
    }
    if (JSONInput.blockedUsers) {
      if (JSONInput.blockedUsers) {
        user["blockedUsers"] = JSONInput.blockedUsers;
      }
    }
    if (JSONInput.projects) {
      if (JSONInput.projects.lenght > 0) {
        user["projects"] = JSONInput.projects;
      }
    }
    if (JSONInput.savedProjects) {
      if (JSONInput.savedProjects.length > 0) {
        user["savedProjects"] = JSONInput.savedProjects;
      }
    }
    if (JSONInput.skills) {
      if (JSONInput.skills.length > 0) {
        const skillSet = [];
        for (let i = 0; i < JSONInput.skills.length; i++) {
          const tempSkill = JSONInput.skills[i];
          const skillName = tempSkill.skillName;
          const skillLevel = tempSkill.expertiseLevel;
          skillSet.push({ skillName: skillName, expertiseLevel: skillLevel });
        }
        user["skills"] = skillSet;
      }
    }
    if (JSONInput.socialLinks) {
      if (JSONInput.socialLinks.length > 0) {
        const socialLinksSet = [];
        for (let i = 0; i < JSONInput.socialLinks.length; i++) {
          const tempSLink = JSONInput.socialLinks[i];
          const socialProvidername = tempSLink.socialProvidername;
          const socialProviderUserName = tempSLink.socialProviderUserName;
          socialLinksSet.push({
            socialProvidername: socialProvidername,
            socialProviderUserName: socialProviderUserName,
          });
        }
        user["socialLinks"] = socialLinksSet;
      }
    }

    if (JSONInput.aboutMe) {
      user["aboutMe"] = JSONInput.aboutMe;
    }
    if (JSONInput.verified || !JSONInput.verified) {
      user["verified"] = JSONInput.verified;
    }
  }

  return user;
};


const formatInputProjectData = (projectData) => {
    const project = {};
    console.log("we are here");
    console.log(typeof projectData);
    if(typeof projectData == "string"){
        const JSONInput = JSON.parse(projectData);
        if(JSONInput._id){
            project["_id"] = JSONInput._id;
        }
        if(JSONInput.title){
            project["title"] = JSONInput.title;
        }
        if(JSONInput.description){
            project["description"] = JSONInput.description;
        }
        if(JSONInput.content){
            project["content"] = JSONInput.content;
        }
        if(JSONInput.updatedBy){
            project["updatedBy"] = JSONInput.updatedBy;
        }
        if(JSONInput.hidden || !JSONInput.hidden ){
            project["hidden"] = JSONInput.hidden;
        }
        if(JSONInput.helpRequired){
            project["helpRequired"] = JSONInput.helpRequired;
        }
        console.log("we are here ");
        if(JSONInput.skillsRequiredForHelp){
          console.log("we are here ");
          if(JSONInput.skillsRequiredForHelp.length>0){
            project["skillsRequiredForHelp"] = JSONInput.skillsRequiredForHelp;
          }
        }
        if(JSONInput.colloborators){
            const colloboratorsArray = [];
            JSONInput.colloborators.map(userID => { 
                colloboratorsArray.push(userID);
            });
            project["title"] = colloboratorsArray;
        }
        project["updatedAt"] = Date.now();
    }

    return project;
}

module.exports = resolvers;
