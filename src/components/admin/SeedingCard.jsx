import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const SeedingCard = ({ 
  title, 
  description, 
  Icon, 
  iconColorClass, 
  seedFunction, 
  isLoading, 
  setIsLoading, 
  isDisabled, 
  buttonText,
  buttonGradientClass,
  seedType,
  handleSeedDatabase
}) => {
  return (
    <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-slate-100">
          <Icon className={`mr-3 h-6 w-6 ${iconColorClass}`} />
          {title}
        </CardTitle>
        <CardDescription className="text-slate-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-400">
          {seedType === "Core System" ? "Starts the main application data seeding process. This may take several minutes." : `Adds ${seedType.toLowerCase()} demo data. Does not remove existing data.`}
        </p>
        <Button
          onClick={() => handleSeedDatabase(seedFunction, setIsLoading, seedType)}
          disabled={isLoading || isDisabled}
          className={`w-full text-md py-3 bg-gradient-to-r ${buttonGradientClass} text-white`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Seeding {seedType}...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SeedingCard;