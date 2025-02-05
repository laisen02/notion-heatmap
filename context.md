# Notion Heatmap Web App - Developer Guide

## Overview

This web app enables users to generate an embed link for a 365-day heatmap that can be embedded into their Notion dashboard. The heatmap visualizes habit tracking data stored in a user's Notion database. It is structured as a 7x52 (or 7x53) grid, where:

- Rows represent days of the week (Monday to Sunday or Sunday to Saturday, based on user preference).
- Columns represent weeks of the year (Week 1 to Week 52/53).

The heatmap uses a 5-color gradient scale based on user-defined colors, where darker shades represent higher recorded hours. The backend fetches data from the user's Notion database and applies median normalization with logarithmic scaling to categorize time spent into color levels.

---

## **Pages & Navigation**

### **1. Home Page (/)**

- **UI**: 
  - Hero section explaining the app with a **Sign Up** button redirecting to the login page.
  - The navigation bar is not visible here.

### **2. Login/Signup Page (/auth)**

- **Functionality**: 
  - Allows users to log in or sign up using **Supabase authentication**.
  - Users can sign in via **Google** or **Email/Password**.
  - Options available:
    - **Forgot Password**
    - Toggle between **Sign Up** and **Login**
  
- **Redirect**: 
  - After successful login/signup, users are directed to either the **Create New Heatmap** page (for new users) or the **Dashboard** (for returning users).
  -By default, when a new user signs up, their username will be automatically set to the part of their email address before the '@' symbol. For example, if the email is name@gmail.com, the username will be set to "name". and an empty profile image as default if user didnt setup.

### **3. Create New Heatmap (/create)**

- **Features**:
  - **Heatmap Name**: Customizable name (default: "activity").
  - **Description**: Optional description.
  - **Notion API Key**: User must input this to connect their Notion account.
  - **Notion Database ID**: The database to fetch data from.
  - **Property Column Name**: The properties name user use in notion to define and record the type of activity.
  - **Activity Name**: Defines the type of activity the user choose to show on this heatmap.
  - **Recorded Time Property**: Tracks hours spent per activity.
  - **Color Selection**: Choose the main color (default: orange).
  - **Insights Toggles**:
    - **Average Time Per Active Day** (checked by default).
    - **Total Days Active** (checked by default).
    - **Total Time** (checked by default).
    - **Standard Deviation** (unchecked by default).
  - **Privacy Option**: Set to **Public** or **Private** (Private only hides the heatmap from the profile).
  - Upon creating the heatmap, the app generates an embed link for Notion and stores the configuration in **Supabase**.

### **4. Dashboard (/dashboard)**

- **Features**:
  - Displays all previously created heatmaps in preview blocks.
  - Each block includes:
    - Heatmap Name
    - Description (if set)
    - Embed Link Copy Button Icon. Copy Functionality: When the user clicks the "Copy" button, the system copies the notion embed link to their clipboard. This can be implemented in the frontend using JavaScript (e.g., using document.execCommand('copy') or the modern Clipboard API).

    - Three Dot Icon Button, Which will show the below options after click:
        
        - **Edit** Button, user will navigate to 5. edit heatmap to edit or changes setting of this heatmap.
        - **Delete** button, with a confirmation prompt.
        
  - **Sorting Order of heatmap block**
    - On the dashboard page, include a dropdown menu name "Sort" located at the upper-right corner of the page. This dropdown will allow users to select the sorting order of the displayed heatmap blocks. The sorting options will include:
        - Newest – Sort heatmap blocks by the most recently created.
        - Oldest – Sort heatmap blocks by the earliest created.
        - Ascending – Sort heatmap blocks alphabetically from A to Z by their title.
        - Descending – Sort heatmap blocks alphabetically from Z to A by their title.
        - Recorded Hours – Sort heatmap blocks by the total sum of hours recorded, in descending order (from the heatmap with the most recorded hours).
  - **Search Bar**: A search bar allows users to search for heatmaps.
  - **Create New Heatmap** button at the top-right for easy navigation to the **Create New Heatmap** page.

### **5. Edit Heatmap (/edit/:heatmap_id)**

- **Functionality**:
  - Allows users to edit existing heatmap settings.
  - Pre-fills fields with current settings and allows modification of:
    - Heatmap Name
    - Description 
    - Notion Database ID
    - Property Column Name
    - Activity Name
    - Recorded Time Property
    - Color Selection
    - Toggle options for insights
    - Privacy Option
  - Saves updates to **Supabase**.

### **6. Shared Profile (/profile/:user_id)**

- **Functionality**:
  - A public page showing all the user's created public heatmaps.
  - Displays only **public heatmaps** created by the user.
  - support drag-and-drop reordering of heatmap blocks on the user’s profile page, stores the ordering information for each heatmap block to help the app remember the user's preferred order after they rearrange the blocks.
  - Provides the ability and let user easy to share their profile with others or post on social media about their heatmap.
  - Add a reminder text for user who havent update their profile image or username, they can set their profile info in setting page.

### **7. Settings Page (/settings)**

- **Features**:
  - **Username**: User can set or update their username.
  - **Profile Image**: Option to upload a profile image.
  - **Password Reset**: For email registered users, they can reset their password here.
  - **Buy Me a Coffee**: A future feature for donations (not a priority for initial implementation).
  - **Delete Account**: Users can delete their account with a two-step confirmation process:
    - Step 1: Click "Delete My Account".
    - Step 2: Confirm deletion by re-entering their username and accepting a permanent deletion warning.

---

## **Heatmap Features**

### **1. Heatmap Display**

- **Functionality**: 
  - Displays a 365-day heatmap based on the habit data fetched from Notion.
  - **Colors**: The heatmap uses a 5-color gradient based on user-defined colors. Darker shades represent more time spent on the activity.
  - **Hover Effects**: When hovering over a cell in the heatmap, show the **date** and the **recorded hours** for that day.
  - **Labels**: Display labels for **months** and days **Mon, Wed, Fri, Sun**.
  - **Year Selection**: Users can choose which year to display (defaults to the current year).
  - **Dark Mode Toggle**: Users can toggle between light and dark modes.
  - **Week Start Preference**: A toggle allows users to choose whether the week starts on **Monday** or **Sunday** (default: Monday).

### **2. Data Processing & Scaling**

- **Normalization**: 
  - **Median normalization** is applied to avoid bias from extreme data values.
  - **Logarithmic Scaling**: Time spent on activities is scaled using a logarithmic formula.
    - Example: If the median maximum daily time is 4 hours, color levels are proportional to this value.
  - Supports **multi-year tracking** (e.g., 2024, 2023), if such data exists.
  - Bypasses Notion’s 100-record API limit by applying filters after fetching all relevant data.



### **3. User Authentication & Data Management**

- **Supabase Authentication**:
  - Sign up and log in using **Google** or **email/password**.
  - **User Settings** and **heatmap configurations** are stored in the **Supabase** database.

### **4. Storing the Embed Link:**

When a user creates a new heatmap, the system generates an embed link for the heatmap. This embed link can then be stored in the backend database, specifically in the Heatmaps Table of the Supabase database.
    
- Flow of Storing and Retrieving the Embed Link:

    When the heatmap is created:
        The user provides the necessary data (Notion database ID, heatmap name, color theme, etc.).
        The system generates an embed link (e.g., a URL that can be used to embed the heatmap into a Notion page).
        This embed link is then saved in the Heatmaps Table along with other heatmap settings (name, color, privacy settings, etc.).

    When the user accesses their dashboard:
        The system queries the Heatmaps Table to retrieve all the user's heatmap records.
        The embed link associated with each heatmap is included in the data that’s returned.
        The dashboard renders each heatmap with an option to copy the embed link (e.g., using a "Copy" button next to the embed link for easy copying).


### **6. Drag-and-drop reordering of heatmap blocks on the user’s public profile page**

- When a user rearranges the heatmap blocks on their public profile page, you would update the display_order value in the Heatmaps Table for each heatmap.
    - The drag-and-drop interaction would trigger an update to the database where you set the appropriate display_order value for each heatmap based on the new position.
    The display_order value can be an integer starting from 1 for the first block, 2 for the second, and so on. The order will be determined by the user's drag-and-drop arrangement.

- How to Implement the Ordering Logic:

   - Frontend: When the user drags and drops a heatmap block into a new position, the frontend (e.g., React component) will need to capture the new order and send an API request to the backend.

    - Backend: The backend will need to update the display_order of each heatmap for that user based on the new order and save it in the database.

    - Rendering: When the user visits their profile page again, the system will query the heatmaps sorted by the display_order field and display them in the correct order.

- Considerations for display_order:

    - Handling Gaps: If a user deletes or moves blocks around, automatically reordering the remaining blocks so that there are no gaps in the numbering.

    - Edge Cases: For new users or if no custom order is set, assign a default order based on sequentially in the order they were created.


### **5. Privacy Option**

- **Dropdown Selection**:
  - **Public** (default): The heatmap is displayed on the user’s public profile.
  - **Private**: The heatmap is hidden from the user’s profile but can still be shared via an embed link.

---

## **Tech Stack**

### **Frontend**
- **Next.js**: React-based framework for building the user interface.
- **Tailwind CSS**: A utility-first CSS framework to style the app.
- **ShadCN/UI**: Used for smooth animations and modern interactive components.
- **Vercel**: Hosting platform for deploying the frontend.

### **Backend & Database**
- **Supabase**: PostgreSQL database and authentication service.
- **Notion API**: Used to fetch habit tracking data from Notion.
  
#### **Database Schema (Supabase)**

##### **Users Table**
| Column      | Type   | Description                             |
|-------------|--------|-----------------------------------------|
| id          | UUID   | Unique identifier for the user         |
| email       | String | User's email address                    |
| created_at  | Timestamp | Date of account creation               |
| week_start  | String | User's preferred start of the week     |

##### **Heatmaps Table**
| Column           | Type       | Description                           |
|------------------|------------|---------------------------------------|
| id               | UUID       | Unique identifier for the heatmap    |
| user_id          | UUID       | Reference to the user's ID           |
| name             | String     | Heatmap title                        |
| description      | String     | Optional description                 |
| notion_database_id | String   | Linked Notion database ID            |
| color_theme      | String     | User-defined main color              |
| privacy          | String     | Public or Private                    |
| avg_time_per_day | Boolean    | Toggle for Average Time Per Active Day |
| total_days_active| Boolean    | Toggle for Total Days Active         |
| total_time_spent | Boolean    | Toggle for Total Time Spent          |
| std_deviation    | Boolean    | Toggle for Standard Deviation        |
| week_start       | String     | User's preferred start of the week   |
| created_at       | Timestamp  | Heatmap creation date                |
| embed_link       | String     | The generated embed link for the heatmap |
| display_order    | Integer    | Integer	The order to display the heatmap in the public profile |


##### **Records Table**
| Column      | Type   | Description                             |
|-------------|--------|-----------------------------------------|
| id          | UUID   | Unique identifier for the record       |
| heatmap_id  | UUID   | Reference to the heatmap's ID          |
| date        | Date   | Date of recorded habit                 |
| total_hours | Float  | Total recorded hours on that day       |

---

## **API Flow**
1. User logs in through **Supabase authentication**.
2. User connects their **Notion database**.
3. System fetches and processes data:
   - Reads recorded hours from Notion.
   - Bypasses the 100-record limit by applying filters.
   - Applies median normalization.
   - Applies logarithmic scaling for color levels.
4. The backend generates an embed link based on the heatmap's settings. Heatmap is rendered dynamically based on this processed data.
5. The backend saves the new heatmap in the Heatmaps Table, including the embed_link.
6. On the Dashboard, the system fetches the heatmaps from the database, including the embed_link.
7. The dashboard displays the heatmap with a "Copy Embed Link" button.
    When the user clicks on the button, the embed link is copied to the clipboard.
8. User can embed the copied heatmap link into their Notion dashboard.

  

---

## **Future Improvements**

- Allow users to export heatmap data.
- Add weekly/monthly filtering for heatmaps.
- Introduce AI-based habit insights to provide more personalized recommendations.

---

This guide provides an in-depth look at the structure and features of the **Notion Heatmap Web App**, detailing both front-end and back-end development processes, as well as the data flow and user interaction. This comprehensive overview ensures that developers can successfully implement and extend the application.
