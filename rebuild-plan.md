# Moving the Bitnox Official Website to Nextjs 16+

Rebuild the website located in @client with Nexjs 16+ App directory directly inside @nexjs.
The main reason for migrating to Nextjs is to achieve improved SEO.

## Expected Approach/Features

- All CSS Codes should be written in latest TailwindCSS
- Maintain the same UI design and animations with gsap while making improvements.
- Since Bitnox technology have different services such as Tech Training, IT consultation etc. Ensure the landing page cover all the services except laundry and cleaning. Do not add info about laundry & cleaning on the landing page. All info about laundry and cleaning should only be on the cleaning page.
- Ensure the website is SEO friendly. Implement features for google tag manager and search console.
- Disregard the @server everything should be built in Nextjs16+ using API route and server actions
- Bitnox has a training room of 60 capacity. The training room is available for mini events (e.g tech or other decent gathering), conferences on non-class/training day. Add this as a section on the landing page. I will provide four pictures of the room. Make this standout for SEO.
- maintain the brand identity. Ensure the landing page showcase Bitnox services appropriately so that anyone who visit can easily discover what Bitnox does, navigate to other website of Bitnox Technology. Someone who come to this website looking for courses offered by bitnox should find it easy to navigate to edu.bitnoxsolution.com.
- use shadcn components, reacthook form, zod etc. Form validations on the client and server.
- use tiptap as richtext editor and ensure the editor as advance functionalities with code block in different programing language included.
- Admin dashboard for blog management and site management. password authentication, retain env variables in @server and @client. Retain other data model, rebuild only the blog data model. Existing blog content will be cleared.
