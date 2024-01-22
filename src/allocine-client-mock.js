import { mockedFilmography } from "./mock-data";
import { MockAgent } from "undici";
import { readFileSync, readdirSync } from "fs";

export const allocineClientMockAgent = new MockAgent();
allocineClientMockAgent.disableNetConnect();

const filmo = readFileSync("./src/filmo.html");
const castings = readdirSync("./src/castings");
const actors = readdirSync("./src/actors");
const client = allocineClientMockAgent.get("https://www.allocine.fr");
client
  .intercept({
    path: "/personne/fichepersonne-16349/filmographie/",
    method: "GET",
  })
  .reply(200, filmo)
  .persist()

castings.forEach((movieId) => {
  client
    .intercept({
      path: `/film/fichefilm-${movieId}/casting/`,
      method: "GET",
    })
    .reply(200, readFileSync(`./src/castings/${movieId}`))
    .persist()
  });
actors.forEach((actorId) => {
  client
    .intercept({
      path: `/personne/fichepersonne_gen_cpersonne=${actorId}.html`,
      method: "GET",
    })
    .reply(200, readFileSync(`./src/actors/${actorId}`))
    .persist()
  });

// function isValidBreedImagePath(path) {
//   const match = /\/api\/breed\/([\da-z-]*)\/images/.exec(path);

//   // If the overall path matched and the specific breed they specified was known
//   return match && Breeds[match[1].toLowerCase()] != null;
// }

// Success case when a valid breed is passed
// client
//   .intercept({
//     path: isValidBreedImagePath,
//     method: "GET",
//   })
//   .reply(200, {
//     message: [
//       "https://images.dog.ceo/breeds/hound-walker/n02089867_149.jpg",
//       "https://images.dog.ceo/breeds/hound-walker/n02089867_1504.jpg",
//       "https://images.dog.ceo/breeds/hound-walker/n02089867_1504.jpg",
//     ],
//     status: "success",
//   });

// Error case when an invalid breed is passed
// client
//   .intercept({
//     path: (path) => !isValidBreedImagePath(path),
//     method: "GET",
//   })
//   .reply(404, {
//     message: "Breed not found (master breed does not exist)",
//     status: "error",
//     code: 404,
//   });

// module.exports = agent;
