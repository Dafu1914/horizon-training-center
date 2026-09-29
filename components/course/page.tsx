import CourseCard from "@/components/course/CourseCard";

export default function CoursesPage() {
  const courses = [
    { id: "1", title: "Mathematics Grade 12", description: "Complete Grade 12 math prep.", price: 500, category: "Math" },
    { id: "2", title: "English for Beginners", description: "Speak English confidently.", price: 400, category: "Language" },
    { id: "3", title: "Intro to Programming", description: "Learn Python basics.", price: 800, category: "Tech" },
    { id: "4", title: "Physics Grade 11", description: "Understand physics deeply.", price: 550, category: "Science" },
    { id: "5", title: "Biology Grade 12", description: "Master biology for exams.", price: 600, category: "Science" },
    { id: "6", title: "Business Basics", description: "Learn how business works.", price: 700, category: "Business" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">All Courses</h1>
      <p className="text-gray-600 mb-8">Browse our live training programs.</p>
      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((c) => <CourseCard key={c.id} {...c} />)}
      </div>
    </div>
  );
}