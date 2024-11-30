import re

def complyText(text):
    # First replacement: Replace all specified words with their censored versions
    text = text.replace("Hamas", "H#m#s")
    text = text.replace("Israel", "Is###|")
    text = text.replace("IDF", "Is###| Defense Forces")
    
    # Define a function to revert changes within URLs
    def revert_censorship(match):
        url = match.group(0)
        # Revert the censored words back to their original form within the URL
        url = url.replace("H#m#s", "Hamas")
        url = url.replace("Is###| Defense Forces", "IDF")
        url = url.replace("Is###|", "Israel")
        return url
    
    # Second replacement: Find URLs and revert censorship within them
    text = re.sub(r'http\S+', revert_censorship, text)
    
    return text

def complyTextArray(text_array):
  complied_array = []
  for text in text_array:
    complied_text = complyText(text)
    complied_array.append(complied_text)
  return complied_array
