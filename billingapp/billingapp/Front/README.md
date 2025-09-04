# Billing System Frontend

A modern React-based frontend for the Billing System, built with React 18, Bootstrap 5, and modern web technologies.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with gradient backgrounds and smooth animations
- **Authentication**: Secure login/logout with JWT token management
- **Role-Based Access**: Different interfaces for admin and regular users
- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **Real-time Updates**: Live data fetching from backend APIs
- **Form Validation**: Client-side and server-side validation
- **Toast Notifications**: User-friendly feedback messages
- **Protected Routes**: Secure navigation with authentication guards

## 🛠️ Tech Stack

- **React 18**: Latest React with hooks and modern patterns
- **React Router 6**: Client-side routing
- **Bootstrap 5**: CSS framework for responsive design
- **React Bootstrap**: Bootstrap components for React
- **Axios**: HTTP client for API communication
- **React Icons**: Icon library
- **React Toastify**: Toast notification system
- **Formik & Yup**: Form handling and validation
- **Recharts**: Chart library for data visualization

## 📁 Project Structure

```
Front/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Navbar.js
│   │       └── Footer.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── Bills.js
│   │   ├── Items.js
│   │   ├── Profile.js
│   │   ├── Help.js
│   │   └── admin/
│   │       ├── AdminDashboard.js
│   │       ├── UserManagement.js
│   │       └── AddUser.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Backend Spring Boot application running on port 8080

### Installation

1. **Navigate to the Front directory:**
   ```bash
   cd Front
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## 🔧 Configuration

### Backend Connection

The frontend is configured to connect to the backend at `http://localhost:8080`. You can modify this in:

- `src/contexts/AuthContext.js` - Line 25: `axios.defaults.baseURL`
- `package.json` - Line 47: `"proxy": "http://localhost:8080"`

### Environment Variables

Create a `.env` file in the Front directory for environment-specific configuration:

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_APP_NAME=Billing System
```

## 📱 Available Pages

### Public Pages
- **Login** (`/login`): User authentication

### Protected Pages (Require Authentication)
- **Dashboard** (`/dashboard`): Main dashboard with statistics
- **Bills** (`/bills`): View and manage bills
- **Items** (`/items`): Manage inventory items
- **Profile** (`/profile`): User profile management
- **Help** (`/help`): System documentation

### Admin-Only Pages
- **Admin Dashboard** (`/admin/dashboard`): Administrative overview
- **User Management** (`/admin/users`): Manage system users
- **Add User** (`/admin/users/add`): Create new user accounts

## 🔐 Authentication

The application uses JWT tokens for authentication:

1. **Login**: User provides credentials
2. **Token Storage**: JWT token stored in localStorage
3. **API Calls**: Token automatically included in request headers
4. **Token Validation**: Backend validates token on each request
5. **Logout**: Token removed from localStorage

## 🎨 Customization

### Styling

- **CSS Variables**: Modify colors and spacing in `src/App.css`
- **Bootstrap Override**: Custom Bootstrap classes in `src/App.css`
- **Component Styling**: Individual component styles in respective files

### Themes

The application supports multiple color schemes through CSS classes:
- `.btn-custom`: Primary button style
- `.btn-custom-secondary`: Secondary button style
- `.card-custom`: Card component styling
- `.stats-card`: Statistics card styling

## 📊 API Integration

### Endpoints Used

- **Authentication**: `/api/v1/auth/login`
- **Profile**: `/api/profile`
- **Bills**: `/api/v1/bills`
- **Items**: `/api/v1/items`
- **Users**: `/api/v1/users` (admin only)
- **Setup Status**: `/api/setup/status`

### Error Handling

- **Network Errors**: Automatic retry and user notification
- **Authentication Errors**: Automatic logout on token expiration
- **Validation Errors**: Form-specific error messages
- **Server Errors**: User-friendly error notifications

## 🔒 Security Features

- **Protected Routes**: Authentication-required pages
- **Role-Based Access**: Admin vs. user functionality
- **CSRF Protection**: Built-in CSRF token handling
- **Input Validation**: Client and server-side validation
- **Secure Storage**: JWT tokens in localStorage

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: Bootstrap 5 responsive breakpoints
- **Touch Friendly**: Optimized for touch interfaces
- **Cross Browser**: Compatible with modern browsers

## 🚀 Performance Features

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Builds**: Production-ready builds
- **Caching**: Efficient data caching strategies

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Deployment

### Build and Deploy

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your web server

3. **Configure your server** to serve the React app

### Docker Deployment

```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the Help section in the application
- Review the backend API documentation
- Contact the development team

## 🔄 Updates

### Version 1.0.0
- Initial release with core functionality
- User authentication and management
- Bill and item management
- Admin dashboard
- Responsive design
- Help system

---

**Happy Coding! 🎉**
