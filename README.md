# Admin Management System Frontend

A modern, responsive admin management system built with React, Vite, and TailwindCSS. This application provides a comprehensive interface for both administrators and users to manage tasks, memos, messages, and administrative functions.

## 🚀 Features

### Authentication & Authorization
- Secure user authentication system
- Role-based access control (Admin/User)
- Protected routes and middleware
- Profile management with avatar support

### Admin Dashboard
- Comprehensive admin control panel
- User management system
- Performance monitoring
- Activity tracking
- Quick actions panel
- Recent activity feed

### Communication Features
- Real-time messaging system
- Memo creation and management
- Task assignment and tracking
- Report generation and management
- File attachments support

### User Interface
- Responsive design for all screen sizes
- Modern and intuitive interface
- Dark/Light theme support
- Sidebar navigation for admin panel
- Dynamic navbar with context-aware content
- Loading skeletons for better UX

### Task Management
- Create and assign tasks
- Task status tracking
- Due date management
- Task comments and updates
- File attachments for tasks
- Task filtering and search

### Report System
- Generate detailed reports
- Export functionality
- Report templates
- File attachment support
- Report status tracking

### Settings & Customization
- User profile settings
- Application preferences
- Theme customization
- Notification settings

## 🛠️ Technical Stack

- **Framework:** React with Vite
- **Styling:** TailwindCSS
- **State Management:** Custom stores with Zustand
- **Routing:** React Router v6
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **UI Components:** Custom components with TailwindCSS

## 📦 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── admin/         # Admin-specific components
│   ├── dashboard/     # Dashboard components
│   ├── modals/        # Modal components
│   ├── reports/       # Report-related components
│   ├── settings/      # Settings components
│   ├── skeletons/     # Loading skeleton components
│   └── ui/           # Base UI components
├── constants/         # Application constants
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
├── pages/            # Page components
├── services/         # API services
├── store/            # State management
└── utils/            # Utility functions
```

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd admin-management-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
VITE_API_URL=your_backend_api_url
```

4. **Run the development server**
```bash
npm run dev
```

## 🔧 Configuration

The application can be configured through various environment variables:

- `VITE_API_URL`: Backend API URL
- `VITE_CLOUDINARY_URL`: Cloudinary upload URL (for images)
- `VITE_SMS_API_KEY`: SMS service API key

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Initial work - [bolajeee](https://github.com/bolajeee)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Inspiration from modern admin dashboard designs
- Open source community for the amazing tools and libraries