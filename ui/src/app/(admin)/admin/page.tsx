"use client";

import { Users, MessageSquare, FileText, CreditCard, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Mock data - in real app, this would come from API
const stats = [
  {
    title: "Total Users",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Questions Today",
    value: "156",
    change: "+8.2%",
    trend: "up",
    icon: MessageSquare,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Blog Posts",
    value: "89",
    change: "+2.1%",
    trend: "up",
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Revenue",
    value: "$12,847",
    change: "-2.4%",
    trend: "down",
    icon: CreditCard,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
];

const recentQuestions = [
  {
    id: "1",
    subject: "Mathematics",
    question: "How do I solve quadratic equations using the quadratic formula?",
    user: "Sarah M.",
    status: "answered",
    time: "2 hours ago",
  },
  {
    id: "2",
    subject: "Physics",
    question: "What is the difference between velocity and acceleration?",
    user: "John D.",
    status: "pending",
    time: "3 hours ago",
  },
  {
    id: "3",
    subject: "Chemistry",
    question: "How do I balance chemical equations?",
    user: "Emily R.",
    status: "answered",
    time: "5 hours ago",
  },
  {
    id: "4",
    subject: "Computer Science",
    question: "What are the different sorting algorithms?",
    user: "Mike L.",
    status: "expert_assigned",
    time: "6 hours ago",
  },
];

const recentUsers = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    subscription: "Premium",
    joinDate: "2024-01-15",
    questionsCount: 23,
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    subscription: "Free",
    joinDate: "2024-01-14",
    questionsCount: 5,
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@example.com",
    subscription: "Premium",
    joinDate: "2024-01-13",
    questionsCount: 18,
  },
];

const statusColors = {
  answered: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  expert_assigned: "bg-blue-100 text-blue-800",
};

const subscriptionColors = {
  Premium: "bg-purple-100 text-purple-800",
  Free: "bg-gray-100 text-gray-800",
};

export default function AdminDashboard() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Questions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Questions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              {recentQuestions.map((question) => (
                <div key={question.id} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {question.subject}
                        </Badge>
                        <Badge
                          className={`text-xs ${statusColors[question.status as keyof typeof statusColors]}`}
                        >
                          {question.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {question.question}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>By {question.user}</span>
                        <span>{question.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <Button variant="outline" className="w-full">
                View All Questions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`text-xs mb-1 ${subscriptionColors[user.subscription as keyof typeof subscriptionColors]}`}
                      >
                        {user.subscription}
                      </Badge>
                      <p className="text-xs text-gray-500">{user.questionsCount} questions</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <Button variant="outline" className="w-full">
                View All Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}