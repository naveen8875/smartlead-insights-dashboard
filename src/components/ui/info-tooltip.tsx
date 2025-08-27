import React from 'react';
import { Info } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface InfoTooltipProps {
    title: string;
    description: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
    title,
    description,
    className = '',
    size = 'sm'
}) => {
    const iconSizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={`inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full ${className}`}
                    type="button"
                    aria-label={`More information about ${title}`}
                >
                    <Info className={iconSizes[size]} />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" side="top" align="center">
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">{title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
};
