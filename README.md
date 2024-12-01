# OmiAppsHackathon

View [Video Demo](https://youtu.be/18Z7d7nFJB0)

**ListenLearn revolutionizes learning outside of the classroom.**
## Inspiration 💡
As high school students, we understand the time consuming and ineffective methods that others use. Studying often requires a **complete memory of lessons** and the time for the **tedious process** of making flashcards, practice tests, etc. ListenLearn eliminates these needs using Omi.

Everyone has had an off day where they just can't seem to understand their teacher. ListenLearn safety-proofs your education!

## What it does 📚
ListenLearn uses the power of AI to **transform** your lessons and lectures into **easy to study** and impactful flashcards on a custom studying website. ListenLearn features flashcards, quizzes, and progress dashboards implementing proven study methods to help users optimally learn their content.

## How we built it 💻
![image](https://github.com/user-attachments/assets/55efa94f-75ad-45e8-bb22-34387778e7a5)
For the frontend, we used Next.js, MongoDB and Tailwind to create a **seamless UI** allowing the addition, modifications, sharing and studying of customized flashcards. Our website is **responsive**, allowing users to access our platform on **any device**.

On the backend, we utilized spaCy with the "en_core_web_sm" model for NLP to process and format transcripts into flashcards. Cerebras enhanced these flashcards. We used FastAPI to create three API routes: one for generating flashcards, one for generating a flashcard set code, and one for the webhook that connects with the Omi app.

## Challenges we ran into 💪
As we built our studying frontend **from scratch**,  integrating with Omi was more challenging than just having a user login to an external service. We developed a process in which users set up accounts and sync their frontend with their account to access their personalized sets, and can add and share sets to others.

This makes our app **multifunctional**, being able to be used by teachers, to share study tools for their lessons to their students and students to study from their lesson themselves.

## Accomplishments that we're proud of 🏆
We are proud that our app will be able to help so many students across the world. Education is a serious matter, and our app will make a serious difference in this space. 

## What we learned 🏫
We learned how to seamlessly **integrate** our development with **Omi**, and greatened our understanding and speed of frontend development. These are skills we will forever carry into our lives.

## What's next for ListenLearn 💥
We aim to further the development of ListenLearn by adding more **study methods**, along with flashcards, quizzes, and progress checks, bringing our app parallel with others, like Quizlet, and **enhancing** the generation of sets to be better tailored to the interests of the user.
