"use client";

import { useEffect, useState } from "react";
import { Users, MessageSquare, FileText, CreditCard, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminDashboardData, type AdminDashboardData, type RecentQuestion, type RecentUser } from "@/lib/api/admin.api";
import Link from "next/link";

const statusColors = {
  answered: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  expert_assigned: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
};

const subscriptionColors: Record<string, string> = {
  Premium: "bg-purple-100 text-purple-800",
  Free: "bg-gray-100 text-gray-800",
  Pro: "bg-blue-100 text-blue-800",
  Basic: "bg-green-100 text-green-800",
};

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { stats, recentQuestions, recentUsers } = dashboardData;

  const statsDisplay = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: stats.usersChangePercent,
      trend: stats.usersTrend,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Questions Today",
      value: stats.questionsToday.toLocaleString(),
      change: stats.questionsChangePercent,
      trend: stats.questionsTrend,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Blog Posts",
      value: stats.totalBlogs.toLocaleString(),
      change: stats.blogsChangePercent,
      trend: stats.blogsTrend,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChangePercent,
      trend: stats.revenueTrend,
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsDisplay.map((stat) => (
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
              {recentQuestions.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No questions yet
                </div>
              ) : (
                recentQuestions.map((question: RecentQuestion) => (
                  <div key={question.id} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {question.subject}
                          </Badge>
                          <Badge
                            className={`text-xs ${statusColors[question.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}
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
                ))
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <Link href="/admin/questions">
                <Button variant="outline" className="w-full">
                  View All Questions
                </Button>
              </Link>
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
              {recentUsers.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No users yet
                </div>
              ) : (
                recentUsers.map((user: RecentUser) => (
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
                          className={`text-xs mb-1 ${subscriptionColors[user.subscription] || "bg-gray-100 text-gray-800"}`}
                        >
                          {user.subscription}
                        </Badge>
                        <p className="text-xs text-gray-500">{user.questionsCount} questions</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full">
                  View All Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}