## **The Digital Dinner**

 **Steps for installation:**
 
 

 - Code:
	  1. make sure your pc has GIT/GITHUB.
	  2. open the folder in which you want the project.
	  3. open terminal with the same folder location.
	  4. type: 
		git clone https://github.com/ImmrAD/digital-kitchen.git

 - Frontend:
	 1. cd frontend
	 2. npm install 
	 3. npm run dev
	
	
 - Databases(before running the backend):
 I m assuming that you have MongoDB and PostgreSQL already in your pc.
    1. create a '.env' file in the backend folder.
    2. add this into the .env file

  

 MONGODB_URI=mongodb+srv://(Username):(password)/(collection_name)?retryWrites=true&w=majority 
POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_USER=
POSTGRES_PASSWORD=""
POSTGRES_DB=
PORT=
*fill all the values properly

 - Backend
       1. open new terminal
       2. cd backend 
       3. npm install
       4. node server.js
       
       .Congrats on running The Digital Kitchen locally on your PC.

	I have used MongoDB for storing the Menu Items as MongoDB is easy to use and very flexible the Menu Items can be changed, updated or remove without wasting much time.
	On the other hand, I have also used PostgreSQL for storing User Information like name, email, phone number and Order details because PostgresSQL follows a strict schema and useful for analytics (e.g., total orders per user, average order value).

**Here are the API endpoints created:**

1. User Authentication:
   
   - POST /api/users/register - Register a new user
   - POST /api/users/login - Authenticate a user
2. Menu Items:
   
   - GET /api/menu - Get all menu items
   - GET /api/menu/:id - Get a specific menu item
3. Orders:
   
   - POST /api/orders - Create a new order
   - GET /api/orders - Get all orders (likely admin only)
   - GET /api/orders/:id - Get a specific order
   
These endpoints connect your React frontend with your PostgreSQL and MongoDB databases through Express.js.

**Here's a link to frontend of the application:**
https://cosmic-duckanoo-de9110.netlify.app/        
          
   **Challenges faced:**
	          Personally I wasn't having any idea about postgreSQL  so it was quite challenging but I m grateful that I got the learn something new which I always wanted to learn. 

**Thanks for reading, comments and questions are always appreciated.**

