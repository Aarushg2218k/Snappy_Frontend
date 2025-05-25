export const host = process.env.REACT_APP_SOCKET_HOST || "https://snappy-backend-jnek.onrender.com";
export const socketHost = process.env.REACT_APP_SOCKET_HOST || "https://snappy-backend-jnek.onrender.com";
// export const host = "http://localhost:5000";

// Authentication
export const loginRoute        = `${host}/api/auth/login`;
export const registerRoute     = `${host}/api/auth/register`;
export const logoutRoute       = `${host}/api/auth/logout`;
export const allUsersRoute     = `${host}/api/auth/allusers`;
export const setAvatarRoute    = `${host}/api/auth/setavatar`;

// Messaging
export const sendMessageRoute    = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getmsg`;
export const editMessageRoute    = `${host}/api/messages/edit`;    // new!
export const deleteMessageRoute  = `${host}/api/messages/delete`;  // new!

// Friend Requests
export const sendFriendRequestRoute  = `${host}/api/users/send-request`;
export const acceptFriendRequestRoute = `${host}/api/users/accept-request`;
export const declineFriendRequestRoute = `${host}/api/users/decline-request`;
export const getFriendsRoute = `${host}/api/users/friends`;

// New route to get pending requests
export const getPendingRequestsRoute = `${host}/api/users`;
 


