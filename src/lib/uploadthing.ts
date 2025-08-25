import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";


const f = createUploadthing();

export const ourFileRouter = {
  equipmentImage: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    
    .onUploadComplete(async ({ metadata, file }) => {
 
      console.log("File URL:", file.ufsUrl);

      return {
   
        url: file.url,
        key: file.key,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
