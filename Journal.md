# Budget Calender Dev Journal


## The Goal

This is a personal project for me and my wife so we can be better at building our savings. Sometimes we forget a bill comes out so seeing it in our calender and having a notification should help us keep on track

## Day 1
On a car ride home from work I had a conversation with A I on how to retrieve bank account information such as account balances and transactions. There exist APIs that you can use to securely retrieve that information. The only problem was that there really wasn't a free option. So I think we can make some kind of file to store the data of the calender in a CSV format. I am open to other free options though.
## Day 2

I updated my node and npm to avoid bugs with old packages. I know how I want my app to function but I don't know how I want it to look. Until I have a vision, I will have A I help me with a modern look.

My idea is to have a landing page that is simple but guides the user through the set up process. Just a greeting and login/signup buttons will do. But it needs one more thing cause there is a lot of empty space. Maybe something like an app description section that shows on a basic level what the app is for. 

## Day 3
Today I built out the signup and login flow. On the frontend I made matching forms with error states, and I wired up the form actions so the server handles the submit and can redirect on success. On the backend I created the signup controller/service, added validation for the phone format, and started storing users in a CSV file so I can keep everything free for now. I also learned that GET requests need query params (not a body), and that server action logs show up in the Next terminal instead of the browser console.

## Day 4
Today I worked through the calendar math and recurring events. I updated the bank funds calculation to use the selected day, include same-day entries, and start the month’s balance from the first payday. I added recurring bills/paydays/purchases (weekly, biweekly, monthly) with a months-or-forever duration, auto-population, and delete-once or delete-all behavior. I also added a Savings account: a new signup field for initial savings, a new “Move to Savings” event type, a Bank Savings balance card, and savings totals in analytics and projections. On the backend I added recurring rules storage, expanded them into the calendar, and extended the CSV schema to include savings and recurring IDs.
