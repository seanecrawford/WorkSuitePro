import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star, UserCircle } from 'lucide-react';

const testimonials = [
  {
    name: "Alex Johnson",
    title: "CEO, Tech Solutions Inc.",
    quote: "Work Suite Pro has revolutionized how we manage projects. The ability to customize dashboards and integrate our existing tools has been a game-changer for productivity.",
    avatarText: "AJ",
    stars: 5,
  },
  {
    name: "Maria Garcia",
    title: "Project Manager, Creative Designs LLC",
    quote: "The reporting features are incredibly powerful. We can now generate insights in minutes that used to take hours. Highly recommend Work Suite Pro!",
    avatarText: "MG",
    stars: 5,
  },
  {
    name: "David Lee",
    title: "Lead Developer, Innovate Apps",
    quote: "As a developer, I appreciate the robust API and the ease of data management. Work Suite Pro's security model also gives us peace of mind.",
    avatarText: "DL",
    stars: 4,
  },
];

const TestimonialsSection = () => {
  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
        delayChildren: 0.2,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    offscreen: { opacity: 0, y: 20 },
    onscreen: { opacity: 1, y: 0 }
  };

  return (
    <section id="testimonials" className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-100 mb-4">
            Trusted by Teams Worldwide
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Hear what our users say about Work Suite Pro and how it's transforming their workflows.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={cardVariants}
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full bg-slate-800/60 border-slate-700/50 shadow-xl flex flex-col">
                <CardContent className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex mb-3">
                      {[...Array(testimonial.stars)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                      ))}
                      {[...Array(5 - testimonial.stars)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-slate-600" />
                      ))}
                    </div>
                    <p className="text-slate-300 italic mb-6 text-lg leading-relaxed">"{testimonial.quote}"</p>
                  </div>
                  <div className="flex items-center mt-auto">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl mr-4">
                      {testimonial.avatarText ? testimonial.avatarText : <UserCircle className="h-8 w-8" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100 text-lg">{testimonial.name}</p>
                      <p className="text-sm text-slate-400">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;