// components/DynamicGraph.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts/es6';

// Dummy data and titles from your original file
const graphTitles = [
  "Quarterly Startup Creation vs. Incubation",
  "Monthly Funding Rounds and Events",
  "Projects and Mentors by Sector",
  "Global Startup Ecosystem Growth",
];

const generateDummyData = (graphIndex: number) => {
    switch (graphIndex) {
        case 0:
            return [
                { name: 'Q1', Startups: 4000, Incubated: 2400 },
                { name: 'Q2', Startups: 3000, Incubated: 1398 },
                { name: 'Q3', Startups: 2000, Incubated: 9800 },
                { name: 'Q4', Startups: 2780, Incubated: 3908 },
            ];
        case 1:
            return [
                { name: 'Jan', Funding: 2400, Events: 1200 },
                { name: 'Feb', Funding: 1398, Events: 1500 },
                { name: 'Mar', Funding: 9800, Events: 1800 },
                { name: 'Apr', Funding: 3908, Events: 1000 },
            ];
        case 2:
            return [
                { name: 'A.I', Projects: 50, Mentors: 25 },
                { name: 'Fintech', Projects: 35, Mentors: 18 },
                { name: 'Health', Projects: 28, Mentors: 15 },
                { name: 'EdTech', Projects: 42, Mentors: 22 },
            ];
        case 3:
            return [
                { name: 'EU', Growth: 1.5, Investment: 0.8 },
                { name: 'US', Growth: 2.1, Investment: 1.2 },
                { name: 'Asia', Growth: 3.5, Investment: 2.5 },
                { name: 'Africa', Growth: 1.2, Investment: 0.5 },
            ];
        default:
            return [];
    }
};

export default function DynamicGraph({ currentGraphIndex }: { currentGraphIndex: number }) {
    const dummyData = generateDummyData(currentGraphIndex);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentGraphIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
            >
                <h3 className="text-center text-sm font-light text-gray-300 mb-2">{graphTitles[currentGraphIndex]}</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dummyData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                        <XAxis dataKey="name" stroke="#a0a0a0" />
                        <YAxis stroke="#a0a0a0" />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                color: '#fff',
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                        {Object.keys(dummyData[0] || {}).filter(key => key !== 'name').map((key, i) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                fill={i % 2 === 0 ? '#8884d8' : '#82ca9d'}
                                radius={[10, 10, 0, 0]}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        </AnimatePresence>
    );
}