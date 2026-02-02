# CampusCred - Academic Document Management Platform

![CampusCred Logo](public/images/logo.png)

A secure digital locker platform for academic documents with faculty verification capabilities. Built with Next.js, TypeScript, and Supabase for modern educational institutions.

## 🎯 What CampusCred Does

CampusCred provides students and faculty with a comprehensive document management system that:

- **Secure Storage**: Stores academic documents in encrypted digital lockers
- **Faculty Verification**: Enables faculty members to verify and authenticate student documents
- **Smart Organization**: Automatically categorizes and tags documents for easy retrieval
- **Audit Trail**: Maintains complete logs of all document activities and verifications
- **Sharing Capabilities**: Allows secure document sharing via QR codes and controlled access links

## ✨ Key Features & Benefits

### For Students
- **Digital Locker**: Personal secure storage for all academic documents
- **Easy Upload**: Drag-and-drop interface with bulk upload support
- **Smart Search**: Find documents quickly with metadata and tag-based search
- **Verification Status**: Track document verification progress in real-time
- **Mobile Access**: Responsive design works seamlessly on all devices

### For Faculty
- **Verification Dashboard**: Efficiently review and verify student documents
- **Batch Operations**: Process multiple documents simultaneously
- **Audit Logs**: Complete transparency of verification activities
- **QR Code Generation**: Quick access to shared documents
- **Access Control**: Granular permissions for document sharing

### For Institutions
- **Centralized Management**: Unified platform for all document verification needs
- **Security First**: Row-level security and encrypted storage
- **Scalable Architecture**: Built to handle institutional-scale document volumes
- **Compliance Ready**: Audit trails and access logging for regulatory compliance

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database and authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/student-portfolio-website.git
   cd student-portfolio-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Run Supabase migrations
   npx supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

The project includes comprehensive database migrations in the `supabase/migrations/` directory. Key tables include:

- `users` - User accounts and profiles
- `documents` - Document storage and metadata
- `folders` - Hierarchical folder organization
- `verification_logs` - Audit trail for verifications
- `qr_codes` - QR code mappings for sharing

Run all migrations to set up the complete database schema:

```bash
npx supabase db reset
npx supabase db push
```

## 📚 Usage Examples

### Student Document Upload

```typescript
// Example: Upload a document
const { data, error } = await supabase
  .from('documents')
  .insert({
    title: 'Transcript Fall 2024',
    category: 'academic_records',
    file_url: 'https://storage.supabase.co/...',
    user_id: userId
  });
```

### Faculty Verification

```typescript
// Example: Verify a document
const { data, error } = await supabase
  .from('verification_logs')
  .insert({
    document_id: documentId,
    faculty_id: facultyId,
    status: 'verified',
    verified_at: new Date().toISOString()
  });
```

### Document Sharing

```typescript
// Example: Generate QR code for sharing
import QRCode from 'qrcode';

const qrCodeUrl = await QRCode.toDataURL(shareUrl);
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **State Management**: SWR, React Hooks
- **UI Components**: Radix UI, Lucide React

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── (dashboard)/     # Protected dashboard routes
│   ├── api/            # API endpoints
│   ├── faculty/        # Faculty-specific pages
│   └── auth/           # Authentication pages
├── components/         # Reusable React components
│   ├── locker/         # Document locker components
│   ├── verification/   # Verification UI components
│   ├── sharing/        # Document sharing components
│   └── ui/            # Base UI components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── types/             # TypeScript type definitions
└── middleware.ts     # Next.js middleware
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code style and conventions
- Pull request process
- Issue reporting
- Development setup

### Quick Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run lint`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📖 Documentation

- [API Documentation](docs/api.md) - Detailed API reference
- [Database Schema](docs/database.md) - Database structure and relationships
- [Deployment Guide](docs/deployment.md) - Production deployment instructions
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## 🆘 Getting Help

- **GitHub Issues**: [Report bugs and request features](https://github.com/your-username/student-portfolio-website/issues)
- **Discussions**: [Community discussions and Q&A](https://github.com/your-username/student-portfolio-website/discussions)
- **Email**: support@campuscred.edu
- **Documentation**: [Full documentation site](https://docs.campuscred.edu)

## 🏆 Maintainers

- **[@kriidevx](https://github.com/kriidevx)** - Project Lead & Full Stack Developer
- **[@maintainer2](https://github.com/maintainer2)** - Backend & Database Specialist
- **[@maintainer3](https://github.com/maintainer3)** - Frontend & UI/UX Designer

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Supabase](https://supabase.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Inspired by modern educational document management needs

## 📊 Project Status

![Build Status](https://img.shields.io/github/workflow/status/your-username/student-portfolio-website/CI)
![Version](https://img.shields.io/github/package-json/v/your-username/student-portfolio-website)
![License](https://img.shields.io/github/license/your-username/student-portfolio-website)
![Last Commit](https://img.shields.io/github/last-commit/your-username/student-portfolio-website)

---

**CampusCred** - Empowering academic document management for the digital age. 🎓✨
