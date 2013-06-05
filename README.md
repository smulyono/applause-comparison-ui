# CS2302 - Applause Competitive Analysis: Compare Up to 5 Apps 

## Requirement Overview

Develop a search interface using any technology (AngularJS preferrably) 
on heroku that will leverage Applause.com API to compare up to 5 apps side by side.  
Your goal for this challenge is to just develop the UI and make basic API call to 
search apps within Applause.com database.

## Video Demonstration

[Video - 1](http://www.screencast.com/t/ZMFhQzW0S2)

[Video - 2](http://www.screencast.com/t/kkn1X7V6)


## Application URL 

[CS2302applause - http://cs2302applause.appspot.com/](http://cs2302applause.appspot.com/)

## How to run it locally

		* Unzip src file
		> mvn clean package
		
		To run Development Server
		> mvn appengine:devserver
		
		OR use Jetty Server
		> mvn jetty:run
		
		Access application on http://localhost:8080/


## Application Structure

Application was built using : 

* Google App Engine 
* Spring MVC
* AngularJS 

The application is mainly using GAE and Spring MVC as an application holder, so it
can be hosted inside Google App Engine. The main functionality is built upon AngularJS. 
All interaction with Applause API are using AngularJS standard $http and utilizes the $q
for managing the promises object. 

Because the application is using Google App Engine and Spring MVC, so it has one request 
mapping which redirected to one view of _index.jsp_.

        Request to '/' --> PageController --> _index.jsp_
    	
After that, all operations are basically using AngularJS. 

Under Spring MVC, there are several path which is mapped for static resources. These mapping can be found at __src/main/webapp/WEB-INF/spring/servlet-content.xml__. 

```
    <mvc:resources location="/WEB-INF/static/js/**" mapping="/js/**"/>
	<mvc:resources location="/WEB-INF/static/css/**" mapping="/css/**"/>
	<mvc:resources location="/WEB-INF/static/html/**" mapping="/html/**"/>
```
Some optimization based on this link [here](https://developers.google.com/appengine/articles/spring_optimization
)

## AngularJS / HTML Structure

Main application starts from _index.jsp_ which will loads up several UI and Javascript Library :

* JQuery
* Bootstrap --> used mainly for UI
* AngularJS --> main library for the application

### AngularJS Application Structure 

* Main Page
		
        - /src/main/webapp/WEB-INF/index.jsp

* Static HTML Page
        
        - /src/main/webapp/WEB-INF/spring/static/html/searchApps.html
        
* Angular Module Files

        - /src/main/webapp/WEB-INF/spring/static/js/app.js 
            * main angular module application
            
        - /src/main/webapp/WEB-INF/spring/static/js/controller.js
            * main angular module controller
            
        - /src/main/webapp/WEB-INF/spring/static/js/service.js
            * main angular modele services
            
        - /src/main/webapp/WEB-INF/spring/static/js/controller/ui1Ctrl.js
            * Controller for the main page (_index.jsp_) which represents the UI-1 from the requirement
        
        - /src/main/webapp/WEB-INF/spring/static/js/controller/ui2Ctrl.js
            * Controller for the dialog / search for apps which represents the UI-2 from the requirement

        - /src/main/webapp/WEB-INF/spring/static/js/services/utilService.js
            * Service class for all utility class, currently only holds the utility to do deep-clone an object
            
        - /src/main/webapp/WEB-INF/spring/static/js/services/applauseService.js
            * Service class for doing all API communication with Applause endpoint
            
        - /src/main/webapp/WEB-INF/spring/static/js/serivces/searchModelService.js
            * This service class will act as Model for Search Data.
            
        - /src/main/webapp/WEB-INF/spring/static/js/services/viewModelService.js
            * This service class will act as Model for Main Comparison Page
            
### AngularJS Application Flow

There are 2 service class which is used to act as the Model or DAO class, these files are :

* searchModelService.js
* viewModelService.js

From the name, it should clearly shows which data they are holding. The class is responsible for maintaing and keeping the most up to date / current data and notify / broadcast them to the other scopes / child scopes which needed them. 

The other 2 controller file, will responsible for managing the needs of the data and the UI / presentation of the page. There are 2 controller used in this application : 

* ui1Ctrl.js
* ui2Ctrl.js


These 2 controller will interact with other services specially the model class to retrieve and manipulate the data. 

Interaction needed between the application and Applause is handled by :

* applauseService.js

This service class will be responsible to do the GET REST call to Applause end point, and the Model class will be responsible to mapped / processed them so it can be used by the UI. 

So overall flow can be described as 

```
REQUEST :: User --> ui1Ctrl --> viewModelService ---> applauseService

RESPONSE:: applauseService --> viewModelService --> ui1Ctrl --> UI
```


*** More information about each class / services / controller can be found on the code documentation (on each of the file ***

Build based on [GAE Spring Skeleton Project](https://github.com/smulyono/gaeskeleton)






