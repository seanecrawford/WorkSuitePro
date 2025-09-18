import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Library, X } from 'lucide-react';
import LibraryCourseCard from '@/components/academy/library/LibraryCourseCard';
import CourseDetailModal from '@/components/academy/library/CourseDetailModal';

const LibraryDrawer = ({ courses, isLoading, onProgressUpdate, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ topic: 'all', date: 'newest' });
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const filteredCourses = useMemo(() => {
    let sorted = [...courses];
    if (filters.date === 'newest') {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return sorted.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm, filters]);

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { x: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Library className="h-5 w-5" />
                My Course Library
              </h3>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 border-b border-border">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search library..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filters.date} onValueChange={(value) => handleFilterChange('date', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="flex-grow">
              <div className="p-4">
                {isLoading ? (
                  <p className="text-center text-muted-foreground">Loading library...</p>
                ) : filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredCourses.map((course) => (
                      <LibraryCourseCard key={course.id} course={course} onViewDetails={handleViewDetails} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <Library className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground">Your Library is Empty</h3>
                    <p>Generate and save courses to see them here.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
          <CourseDetailModal
            course={selectedCourse}
            isOpen={!!selectedCourse}
            onClose={handleCloseModal}
            onProgressUpdate={onProgressUpdate}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default LibraryDrawer;