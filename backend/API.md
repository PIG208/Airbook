# Supported APIs

## Endpoints

- `GET /`: Serve the login page or the home page if a session exists.
- `POST /register/<register_type>`: Create a new account.
- `GET /search-public/<filter>`: Make a call to a public filter.
- `POST /search/<filter>`: Make a call to a protected filter (reqiures authentication).
- `POST /login/<login_type>`: Login for one of the three user types.

## Specifications

- `POST /register/<register_type>`

    Register as one of the three types of new users.

    ---

    **Supported Params**

    - register_type:
        - cust
        - staff
        - agent

    ---

    **Request**
    
    - `POST /register/cust`:

        ```json
        {
            "email": "your-email@example.com",
            "name": "your-name",
            "password": "exampleasd12345",
            "phone_number": "phone_number",
            "date_of_birth": "1944-02-01",
            "passport_number": "N12345",
            "passport_expiration": "2026-03-01",
            "passport_country": "United States",
            "street": "Jay St. 123",
            "city": "New York City",
            "state": "NY"
        }
        ```
    - `POST /register/staff`:

        ```json
        {
            "username": "your-username",
            "password": "test12345",
            "first_name": "your-first-name",
            "last_name": "your-last-name",
            "date_of_birth": "1999-01-01",
            "airline_name": "China Eastern"
        }
        ```
    - `POST /register/agent`:
    
        ```json
        {
            "email": "your-email@example.com",
            "password": "agentpassword",
        }
        ```

    ---

    **Response**

    ```json
    {
        "result": "success"
    }
    ```

    - For booking agent registration
  
        ```json
        {
            "result": "success",
            "id": 2
        }
        ```

    ```json
    {
        "result": "error",
        "messasge": "Missing required key \"email\"",
    }
    ```

-----

- `GET /search-public/<filter>`

    Request filtered data from the server (public information only).

    **Supported Params**

    - filter:
        - all_future
    
    ---

    **Request**

    No required fields.
    
    ---

    **Response**

    - `GET /search-public/all_future`

        ```json
        {
            "result": "success",
            "data": [
                [
                    2323,
                    "2021-05-28",
                    "15:31:14",
                    "JFK",
                    "2021-05-29",
                    "12:40:14",
                    "MSC",
                    "45.00",
                    "delayed",
                    22,
                    "China Eastern"
                ],
                [
                    7777,
                    "2022-05-28",
                    "15:31:14",
                    "MSC",
                    "2022-05-29",
                    "12:40:14",
                    "JFK",
                    "1000.00",
                    "ontime",
                    20,
                    "China Eastern"
                ]
            ]
        }
        ```

-----

- `POST /search/<filter>`

    Request data from the server using advanced filters (authenticated users only).

    **Supported Params**

    - filter

        - Customer

            - customer_future
            - customer_tickets

        - General

            - advanced_flights
            - advanced_spendings
    
    ---
    
    **Request**
    
    - `POST /search/customer_future`: Give all the future flights of the customer.

        No required fields.

    - `POST /search/customer_tickets`: Give all the tickets purchased by the customer.

        No required fields.

    - `POST /search/advanced_flight`: Return a list of flights given some specific constraints.

        - [Optional] filter_by_emails: `boolean` Default to False. When set to True, the result will only contain flights that the specified customer/booking agent (by email) have bought tickets for.
        - [Optional] emails: `list[str]` Can only be used by staff users. This field is set to their email for booking agents and customers.
        - [Optional] is_customer: `boolean` Default to True for staff users. Can only be used by staff users. This field determines whether the `emails` field represents customer email or booking agent email.
        - [Optional] flight_number: `int`
        - [Optional] dep_date_lower: `str`
        - [Optional] dep_date_upper: `str`
        - [Optional] dep_time_lower: `str`
        - [Optional] dep_time_upper: `str`
        - [Optional] arr_date_lower: `str`
        - [Optional] arr_date_upper: `str`
        - [Optional] arr_time_lower: `str`
        - [Optional] arr_time_upper: `str`
        - [Optional] dep_airport: `str`
        - [Optional] dep_city: `str`
        - [Optional] arr_airport: `str`
        - [Optional] arr_city: `str`

-----

- `POST /login/<login_type>`

    Login as one of the three types of users.

    ---

    **Supported Params**

    - login_type:
        - cust
        - staff
        - agent

    ---

    **Request**

    - `POST /login/cust`
    
        ```json
        {
            "email": "test@example.com",
            "password": "123123"
        }
        ```

    - `POST /login/agent`
    
        ```json
        {
            "email": "booking@agent.com",
            "booking_agent_id": "2",
            "password": "asdasd"
        }
        ```
        
    - `POST /login/staff`
    
        ```json
        {
            "username": "staffone",
            "password": "ouasdasd"
        }
        ```
    
    **Response**

    ```json
    {
        "result": "success"
    }
    ```

    ```json
    {
        "result": "error",
        "message": "The input information or the password does not match"
    }

- `POST /fetch-session`

    Fetch the current session and retrieve the user data (if there is any).