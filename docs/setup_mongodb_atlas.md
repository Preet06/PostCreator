# MongoDB Atlas Setup Guide

Follow these steps to set up your free MongoDB database and get the connection string.

## 1. Create an Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Sign up for a free account (or log in).

## 2. Create a Cluster
1. After logging in, create a new **Project** (name it "PostCreator").
2. Click **Build a Database**.
3. Select **M0 Free** (Shared) tier.
4. Choose a provider (AWS/Azure/GCP) and region close to you.
5. Click **Create Deployment** (or "Create").

## 3. Configure Security (Quickstart)
1. **Username & Password**: 
   - Create a database user (e.g., `admin`).
   - **IMPORTANT**: Write down the password! You won't see it again.
2. **IP Access List**:
   - Select **"Allow Access from Anywhere"** (0.0.0.0/0) for development ease.
   - Or select "Add My Current IP Address" (more secure, but you might need to update it if your IP changes).
3. Click **Finish and Close**.

## 4. Get Connection String
1. On the database dashboard, click **Connect**.
2. Select **Drivers**.
3. Ensure **Node.js** is selected.
4. Copy the connection string. It will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

## 5. Update Your Project
1. Replace `<password>` with the password you created in step 3.
2. Open `c:\Project\PostCreator\backend\.env`.
3. Paste the string into `MONGO_URI`:
   ```env
   MONGO_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
