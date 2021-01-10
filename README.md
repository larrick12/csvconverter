# CSV TO JSON CONVERTER

Api service that convert input spreedsheet url to csv format, then return json format.

for example: if we receive this format of json file
  {
    "csv" : {
      "url" : "https://docs.google.com/spreedsheet/1/d/1qNsjajhhHSOhnnsjOd9HohY/edit#gid=0",
      "selected_fields" : ["firstname", "lastname", "age", "phone number"]
      }
  }
  
  
  the returned format after convertion if the selected file is one
  
  {
    "cpnvertion_key": "1oHJshojOJoIubuigyg_96kjg",
    "json" : {
      "firstname" : "name",
      "lastname" : "names",
      "age" : "age",
      "phone number" : "phone number"
      }
   }
   
   
   if the returned selected value is more than one then you get array returned value
   
   {
      "convertion_key" : "138hBBIUGYhbkgygGkgyhgy-qwk_JHDO",
      "json" : [
          {
            "firstname" : "first",
            "lastname" : "last",
            "age" : "age",
            "phone number" : "phone number"
            },
            {
            "firstname" : "first",
            "lastname" : "last",
            "age" : "age",
            "phone number" : "phone number"
            }
        ]
     }
     
     ## Glitch link to use the api
     
     ### Live url
    - https://concise-dynamic-watercress.glitch.me
