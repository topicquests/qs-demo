import { Notify } from "quasar";
import axiosInstance from "../../boot/axios";

export async function getGuilds(opts, token) {
  const options = token ? {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  } : {};
    return axiosInstance.get("/guilds", options
  ).then(function(response) {
     return response;
   }).catch(function(error){
      console.log("Error in getGuild");
   });
  }

  export async function updateGuild(guild, token) {
    const id = guild.id;

   return axiosInstance.put(`/guilds/${id}`, guild,
   {
   headers: {
    'Authorization': `Bearer ${token}`
   }
  }).then (function(response) {
    Notify.create({
      message: `Guild was updated successfully`,
      color: "positive"
  });
      return response;
   }).catch(err => {
    if (err.response) {
      let errorCode = err.response.data.code;
        Notify.create({
          message: `There was an error updating quest. If this issue persists, contact support.`,
          color: "negative"
        });
        console.log ("Error in updating guild ", err.response)
        console.log("Authenentiation token : ", token)
      }
    })
  }

  export  function createGuild(guild, token) {
    const options = token ? {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } : {};
    return axiosInstance.post("/guilds", {
      "name": guild.name,
       "handle": guild.handle,
       "description": guild.description,
       "public": guild.public,
       "createdAt": guild.createdAt,
       "updatedAt": guild.updatedAt
    }, options

    ).then (function(response) {
      Notify.create({
         message: `New guild was created successfully`,
         color: "positive"
     })
     return response;
   })
     .catch(err => {
      if (err.response) {
        let errorCode = err.response.data.code;
          Notify.create({
            message: `There was an error creating new guild. If this issue persists, contact support.`,
            color: "negative"
          });
        }
    })
   }

   export async function checkIfMemberBelongsToGuild(id, token) {
    const options = token ? {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } : {};
     return axiosInstance.get("/guild_membership?user_id=eq." + id, options,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(response => {
      return response
    })
    .catch(err => {
      let errorCode = err.response.data.code;
        Notify.create({
          message: 'There was an error finding your guild',
          color: "negative"
      });
      console.log("Error in check member belongs to guild ", err);
    })
  }

  export async function joinGuild(guildId, userId, token) {
    const options = token ? {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } : {};

   return axiosInstance.post("/guild_membership", {
     "guild_id": guildId,
     "user_id": userId
   }, options
  ).then (function(response) {
    Notify.create({
      message: `Guild was updated successfully`,
      color: "positive"
  });
      return response;
   }).catch(err => {
    if (err.response) {
      let errorCode = err.response.data.code;
        Notify.create({
          message: `There was an error updating quest. If this issue persists, contact support.`,
          color: "negative"
        });
        console.log ("Error in updating guild ", err.response)
        console.log("Authenentiation token : ", token)
      }
    })
  }

  export async function getGuildMembersById(guild_id, token) {
    const options = token ? {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } : {};
    return axiosInstance.get("/guild_membership?guild_id=eq." + guild_id, options,
   {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   }).then(response => {
     return response
   })
   .catch(err => {
     let errorCode = err.response.data.code;

     console.log("Error in get member in guild with guildId " + id, err);
   })
 }