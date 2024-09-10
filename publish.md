To publish your package to **GitHub Packages**, you'll follow these steps. Below is a detailed guide on how to configure your project, authenticate with GitHub, and publish your package.

### Steps to Publish to GitHub Packages

#### 1. **Prepare Your `package.json` for GitHub Packages**

To publish to GitHub Packages, you need to update your `package.json` to point to GitHub's registry.

Here’s an example of the required modifications:

```json
{
  "name": "@bookracy/bookracy-convertor",  // Use your GitHub username
  "version": "1.0.0",
  "description": "A tool to convert EPUB files to PDF using jsPDF",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc && vite build"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/bookracy/bookracy-convertor.git"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/"
  },
  "author": "Bookracy",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/bookracy/bookracy-convertor/issues"
  },
  "homepage": "https://github.com/bokracy/bookracy-convertor#readme"
}
```

Key points:
- **Name format**: The package name must be in the format `@<github-username>/<package-name>`.
- **Registry URL**: Set the `publishConfig.registry` field to `https://npm.pkg.github.com/` to tell `npm` where to publish the package.

#### 2. **Login to GitHub npm Registry**

Before you can publish, you need to authenticate with GitHub's npm registry.

1. Create a **Personal Access Token (PAT)** on GitHub:
   - Go to [GitHub Settings -> Developer Settings -> Personal Access Tokens](https://github.com/settings/tokens).
   - Click **Generate New Token**.
   - Give it a descriptive name and enable the following scopes:
     - `read:packages`
     - `write:packages`
     - `repo` (if you’re publishing from a private repository)
   - Click **Generate Token** and copy it (you won’t be able to see it again).

2. Authenticate using the token with npm:
   ```bash
   npm login --registry=https://npm.pkg.github.com
   ```

   You will be prompted for:
   - **Username**: Your GitHub username.
   - **Password**: Your GitHub personal access token (PAT).
   - **Email**: Your GitHub-associated email.

#### 3. **Build the Project**

Make sure you build the project before publishing, so that all necessary files (like compiled TypeScript) are in place.

```bash
npm run build
```

#### 4. **Publish the Package**

Once you've logged in and built the project, you can publish it to GitHub Packages.

```bash
npm publish
```

If everything is set up correctly, your package will now be available in GitHub Packages.

#### 5. **Verify the Package on GitHub**

You can verify that the package has been published by navigating to:

```bash
https://github.com/yourusername/bookracy-convertor/packages
```

Here, you should see the published package with details such as version and download statistics.

#### 6. **Installing the GitHub Package**

To install this package from GitHub Packages in another project, users can run:

```bash
npm install @yourusername/bookracy-convertor --registry=https://npm.pkg.github.com
```

Alternatively, they can configure their `.npmrc` file to include the GitHub registry and avoid passing the `--registry` flag.

---

### Optional: Setting Up `.npmrc` for Global Usage

You can also set up a global `.npmrc` configuration to automatically use GitHub Packages for all of your scoped packages (`@yourusername`). Add the following to your `.npmrc` file (either globally or in your project directory):

```ini
@yourusername:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_PERSONAL_ACCESS_TOKEN
```

Replace `YOUR_PERSONAL_ACCESS_TOKEN` with the GitHub PAT you generated earlier. This way, you don’t need to specify the registry every time you install or publish your package.

---

### Summary of Commands

1. **Prepare `package.json`**:
   - Modify your package name and `publishConfig` for GitHub Packages.

2. **Create a Personal Access Token (PAT)**:
   - Generate a token with `read:packages`, `write:packages`, and `repo` permissions.

3. **Login to GitHub Packages**:
   - Run the login command and use your PAT for authentication:
     ```bash
     npm login --registry=https://npm.pkg.github.com
     ```

4. **Build and Publish**:
   - Build the project:
     ```bash
     npm run build
     ```
   - Publish the package:
     ```bash
     npm publish
     ```

5. **Verify**:
   - Check the GitHub packages page to confirm the publish.

---

Following these steps will ensure your `bookracy-convertor` package is successfully published to GitHub Packages!
