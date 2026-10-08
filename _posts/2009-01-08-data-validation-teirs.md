---
excerpt_separator: ""
layout: "archive-post"
title: "Data validation teirs"
date: "2009-01-08T07:30:00.001-05:00"
description: "Data is either valid or invalid right? Well, sort of. I'm working with medical data like the Blood CHEM-7 test. This data has the possibility of being valid and being abnormal. So there is this concept of valid capture d"
topics: ["software-design"]
original_labels: ["GORM","database","grails","groovy","validation"]
original_url: "https://hartsock.blogspot.com/2009/01/data-validation-teirs.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2009-01-08-data-validation-teirs/"
id: bafyr4idpkkyjdxb7qptrsvyvlju3zbgqlbofjhfm3gynabjt3gd4msyy6e
permalink: /posts/data-validation-teirs-d4msyy6e/
---
{% raw %}

Data is either valid or invalid right? Well, sort of. I'm working with medical data like the Blood [CHEM-7](http://www.nlm.nih.gov/medlineplus/ency/article/003462.htm) test. This data has the possibility of being valid and being abnormal. So there is this concept of valid capture data and data that is out of range.

For example here's the CHEM-7 data definition in English:

- BUN: 7 to 20 mg/dL

- CO2 (carbon dioxide): 20 to 29 mmol/L

- Creatinine: 0.8 to 1.4 mg/dL

- Glucose: 64 to 128 mg/dL

- Serum chloride: 101 to 111 mmol/L

- Serum potassium: 3.7 to 5.2 mEq/L

- Serum sodium: 136 to 144 mEq/L

I might code this as an Object and write validators to make sure that the saved data is in range. My Groovy object for GORM might look like this:

```
class Chem7 {

   static belongsTo = [patient:Patient]

   Integer bun

   Integer co2

   Float creatinine

   Integer glucose

   Integer serumChloride

   Float serumPotassium

   Integer serumSodium

   static constraints = {

      bun(nullable:false,range:7..20)

      co2(nullable:false,range:20..29)

      creatinine(nullable:false,range:0.8..1.4)

      glucose(nullable:false,range:64..128)

      serumChloride(nullable:false,range:101..111)

      serumPotassium(nullable:false,range:3.7..5.2)

      serumSodium(nullable:false,range:136..144)

   }

}

```

... but I've got a problem. The very reason that we conduct the CHEM-7 blood test is to find irregularities. The constraints that I've expressed only detail the *normal* range of data for a CHEM-7... so what should I do?

If I make the table definition in the database very generic. Allowing the *table* to accept NULL values or numbers of any kind for each of these values then I can do this with a chem7 object:

```

   chem7.save(validate:false)

```

... as long as the table *underneath* the Grails application can accept the data then I'll save my irregular chem7 test results. This would mean that anyone who was editing the chem7 would get a warning about how it was not a normal test result. Yet no matter how irregular the test was we could still save the results and log who entered them.

So imagine a "Forced Save" button next to the normal save button on your Grails application. Simple enough to write. But it allows us to use validation in a tiered fashion. Validation at the controller and validation at the database. The important thing to keep in mind is that the validation must be weakest at the database level.

{% endraw %}
