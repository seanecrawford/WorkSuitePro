import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const SignUpPage = () => {
    const logoPhotoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/a9365322-bbe3-48f5-a0c3-474b7bc95d50/5dec98958824cda67e815b2d5131d721.png";
    const backgroundImageUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/a9365322-bbe3-48f5-a0c3-474b7bc95d50/7334b87317d393364e880e41a9f24392.jpg";

    return (
        <div 
          className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat p-4"
          style={{ backgroundImage: `linear-gradient(rgba(16, 24, 39, 0.85), rgba(16, 24, 39, 0.95)), url(${backgroundImageUrl})` }}
        >
          <div className="w-full max-w-md">
            <Card className="shadow-2xl bg-card/90 backdrop-blur-sm border-border/50">
              <CardHeader className="text-center">
                <Link to="/dashboard">
                  <img src={logoPhotoUrl} alt="Work Suite Pro Logo" className="w-20 h-auto mx-auto mb-4 transition-transform hover:scale-105" />
                </Link>
                <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2"><AlertCircle /> Page Disabled</CardTitle>
                <CardDescription>Authentication features have been removed.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p>This sign-up page is no longer active. You can now access the application directly.</p>
                <Link to="/dashboard" className="inline-block mt-4 text-primary font-semibold hover:underline">
                  Go to Dashboard
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
    );
};

export default SignUpPage;