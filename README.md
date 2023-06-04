# web-scrapper

Instructions to run the server

- Deploy on local machine.  

    1.1 Connect your local machine to a postgres db-server.  
    1.2 Create a new connection in localhost that follows the ```./ormconfig.ts``` configuration.  
    1.3 Create a new database with name ```db```.   
    1.4 Install the dependencies and devDependencies and start the server, run:    
        ```
        npm install 
        ```. 
        ```
        npm run start 
        ```. 

- Deploy with docker.  
    just run ```docker-compose up -d``` in terminal in the root directory

- Docs:  
