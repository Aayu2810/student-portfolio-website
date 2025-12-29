# Create Faculty User

To create the faculty user with credentials:
- **Email**: `faculty@rvce.edu.in`
- **Password**: `faculty123`

## Option 1: Using Supabase Dashboard (RECOMMENDED)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Click **Add User** > **Create new user**
4. Enter:
   - Email: `faculty@rvce.edu.in`
   - Password: `faculty123`
   - **Auto Confirm User: ✅ MUST BE CHECKED** (This bypasses email confirmation)
5. Click **Create User**
6. After creation, go to **Table Editor** > **profiles**
7. Find the user by email and update the `role` field to `faculty`

**Important:** Make sure "Auto Confirm User" is checked, otherwise the user won't be able to log in without confirming their email.

## Option 2: Using SQL (if user already exists)

If the user already exists in `auth.users`, run this SQL to confirm email and set role:

```sql
-- Auto-confirm the email for the faculty user
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'faculty@rvce.edu.in';

-- Update the profile role to faculty
UPDATE public.profiles
SET role = 'faculty', updated_at = NOW()
WHERE email = 'faculty@rvce.edu.in';
```

**Note:** You need to run this in the Supabase SQL Editor with proper permissions.

## Option 3: Using the App

1. Go to the registration page
2. Register with email: `faculty@rvce.edu.in` and password: `faculty123`
3. After registration, update the profile role in the database:

```sql
UPDATE public.profiles
SET role = 'faculty'
WHERE email = 'faculty@rvce.edu.in';
```

## Verify

After creating the user, verify it works:

1. Go to `/faculty-login`
2. Login with:
   - Email: `faculty@rvce.edu.in`
   - Password: `faculty123`
3. You should be redirected to `/faculty/dashboard`

