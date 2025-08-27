import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface FlexiblePaginationProps {
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    isLoading?: boolean;
    hasMoreData?: boolean; // Whether we know there's more data
    pageSizeOptions?: number[];
    className?: string;
    totalItems?: number; // Optional total for display
}

export const FlexiblePagination: React.FC<FlexiblePaginationProps> = ({
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
    isLoading = false,
    hasMoreData = true,
    pageSizeOptions = [10, 25, 50, 100],
    className = '',
    totalItems,
}) => {
    const [pageInput, setPageInput] = useState(currentPage.toString());

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

    const handlePageJump = () => {
        const page = parseInt(pageInput);
        if (page > 0 && page !== currentPage) {
            onPageChange(page);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handlePageJump();
        }
    };

    const handleNextPage = () => {
        if (hasMoreData) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleFirstPage = () => {
        if (currentPage > 1) {
            onPageChange(1);
        }
    };

    // Update page input when current page changes
    React.useEffect(() => {
        setPageInput(currentPage.toString());
    }, [currentPage]);

    return (
        <div className={`flex items-center justify-between ${className}`}>
            {/* Items counter */}
            <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                    Showing accounts {startItem}-{endItem}
                    {totalItems ? ` of ${totalItems}` : ' of ?'}
                    {` (Page ${currentPage})`}
                </span>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-2">
                {/* First page button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFirstPage}
                    disabled={currentPage === 1 || isLoading}
                    title="Go to first page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                    <span className="sr-only">First</span>
                </Button>

                {/* Previous button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || isLoading}
                    title="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous</span>
                </Button>

                {/* Page input */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Page:</span>
                    <Input
                        type="number"
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onBlur={handlePageJump}
                        className="w-20 h-8 text-center"
                        min="1"
                        disabled={isLoading}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePageJump}
                        disabled={isLoading || parseInt(pageInput) === currentPage || parseInt(pageInput) < 1}
                        className="px-2"
                    >
                        Jump
                    </Button>
                </div>

                {/* Next button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!hasMoreData || isLoading}
                    title="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next</span>
                </Button>

                {/* Page size selector */}
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    disabled={isLoading}
                    className="ml-2 px-2 py-1 text-sm border rounded bg-background"
                >
                    {pageSizeOptions.map(size => (
                        <option key={size} value={size}>
                            {size} per page
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};
