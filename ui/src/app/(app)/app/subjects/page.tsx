"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { subjectApi, type Subject } from "@/lib/api/subject.api";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Brain, GraduationCap, Search, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SubjectsPage() {
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch all subjects
	const { data: subjects = [], isLoading, error } = useQuery({
		queryKey: ['subjects-all'],
		queryFn: () => subjectApi.getAll(undefined, true),
	});

	// Filter subjects based on search
	const filteredSubjects = subjects.filter((subject: Subject) =>
		subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	// Get main subjects (subjects without parent)
	const mainSubjects = filteredSubjects.filter((subject: Subject) => !subject.parentSubjectId);
	const subSubjects = filteredSubjects.filter((subject: Subject) => subject.parentSubjectId);

	if (error) {
		return (
			<div className="flex items-center justify-center h-96">
				<Card className="max-w-md">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-red-600">
							<BookOpen className="h-5 w-5" />
							Error Loading Subjects
						</CardTitle>
						<CardDescription>
							There was an error loading subjects. Please try again later.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button onClick={() => window.location.reload()} className="w-full">
							Retry
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="text-center space-y-4">
				<div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-600 to-purple-600 rounded-full mb-4">
					<GraduationCap className="h-8 w-8 text-white" />
				</div>
				<h1 className="text-3xl font-bold tracking-tight">
					Explore Learning Subjects
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					Browse through our comprehensive collection of subjects and start learning with AI-powered assistance.
				</p>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
						<BookOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{subjects.length}</div>
						<p className="text-xs text-muted-foreground">Available to learn</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Main Categories</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{mainSubjects.length}</div>
						<p className="text-xs text-muted-foreground">Major subject areas</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sub-categories</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{subSubjects.length}</div>
						<p className="text-xs text-muted-foreground">Specialized topics</p>
					</CardContent>
				</Card>
			</div>

			{/* Search */}
			<Card>
				<CardContent className="pt-6">
					<div className="relative max-w-md mx-auto">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search subjects..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>
						Jump straight into learning with these popular actions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Button asChild className="h-auto p-4 justify-start">
							<Link href="/app/chat">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
										<Brain className="h-5 w-5 text-purple-600" />
									</div>
									<div className="text-left">
										<div className="font-medium">Ask AI Directly</div>
										<div className="text-sm opacity-70">Start with any question</div>
									</div>
								</div>
								<ArrowRight className="h-4 w-4 ml-auto" />
							</Link>
						</Button>

						<Button asChild variant="outline" className="h-auto p-4 justify-start">
							<Link href="/app/questions">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
										<BookOpen className="h-5 w-5 text-blue-600" />
									</div>
									<div className="text-left">
										<div className="font-medium">View History</div>
										<div className="text-sm opacity-70">See past questions</div>
									</div>
								</div>
								<ArrowRight className="h-4 w-4 ml-auto" />
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Subjects Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
								<div className="h-3 bg-gray-200 rounded w-full"></div>
							</CardHeader>
							<CardContent>
								<div className="h-3 bg-gray-200 rounded w-1/2"></div>
							</CardContent>
						</Card>
					))}
				</div>
			) : searchQuery ? (
				// Search Results
				<div>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold">
							Search Results ({filteredSubjects.length})
						</h2>
						{searchQuery && (
							<Button variant="outline" onClick={() => setSearchQuery("")}>
								Clear Search
							</Button>
						)}
					</div>

					{filteredSubjects.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-16">
								<Search className="h-16 w-16 text-gray-400 mb-4" />
								<h3 className="text-xl font-semibold text-gray-900 mb-2">No subjects found</h3>
								<p className="text-gray-500 mb-4 text-center max-w-sm">
									No subjects match your search. Try different keywords or browse all subjects.
								</p>
								<Button onClick={() => setSearchQuery("")} variant="outline">
									Show All Subjects
								</Button>
							</CardContent>
						</Card>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredSubjects.map((subject: Subject) => (
								<Card key={subject.id} className="group hover:shadow-lg transition-shadow">
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
													{subject.name}
												</CardTitle>
												<CardDescription className="line-clamp-2">
													{subject.description || "Learn about this subject with AI assistance"}
												</CardDescription>
											</div>
											<div className="w-12 h-12 bg-linear-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-lg shrink-0 ml-3">
												{subject.name.charAt(0)}
											</div>
										</div>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="flex items-center justify-between">
											{subject.parentSubjectId ? (
												<Badge variant="secondary">Specialty</Badge>
											) : (
												<Badge variant="default">Main Subject</Badge>
											)}
											<Button asChild size="sm" variant="ghost">
												<Link href={`/app/chat?subject=${subject.id}`}>
													Ask Question
													<ArrowRight className="h-3 w-3 ml-1" />
												</Link>
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			) : (
				// All Subjects - Hierarchical View
				<div className="space-y-8">
					{/* Main Subjects */}
					<div>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-semibold">Main Subjects</h2>
							<Badge variant="secondary">{mainSubjects.length} subjects</Badge>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{mainSubjects.map((subject: Subject) => {
								const relatedSubSubjects = subSubjects.filter((sub: Subject) =>
									sub.parentSubjectId === subject.id
								);

								return (
									<Card key={subject.id} className="group hover:shadow-lg transition-shadow">
										<CardHeader>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
														{subject.name}
													</CardTitle>
													<CardDescription className="line-clamp-2">
														{subject.description || "Learn about this subject with AI assistance"}
													</CardDescription>
												</div>
												<div className="w-12 h-12 bg-linear-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-lg shrink-0 ml-3">
													{subject.name.charAt(0)}
												</div>
											</div>
										</CardHeader>
										<CardContent className="space-y-3">
											{/* Sub-subjects */}
											{relatedSubSubjects.length > 0 && (
												<div>
													<p className="text-sm font-medium text-gray-700 mb-2">
														Specializations ({relatedSubSubjects.length}):
													</p>
													<div className="flex flex-wrap gap-1">
														{relatedSubSubjects.slice(0, 3).map((subSubject: Subject) => (
															<Badge key={subSubject.id} variant="outline" className="text-xs">
																{subSubject.name}
															</Badge>
														))}
														{relatedSubSubjects.length > 3 && (
															<Badge variant="outline" className="text-xs">
																+{relatedSubSubjects.length - 3} more
															</Badge>
														)}
													</div>
												</div>
											)}

											<div className="flex items-center justify-between pt-2">
												<Badge variant="default">Main Subject</Badge>
												<Button asChild size="sm">
													<Link href={`/app/chat?subject=${subject.id}`}>
														Ask Question
														<ArrowRight className="h-3 w-3 ml-1" />
													</Link>
												</Button>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>

					{/* Sub-subjects */}
					{subSubjects.length > 0 && (
						<div>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-semibold">Specialized Subjects</h2>
								<Badge variant="secondary">{subSubjects.length} subjects</Badge>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
								{subSubjects.map((subject: Subject) => {
									const parentSubject = subjects.find((s: Subject) => s.id === subject.parentSubjectId);

									return (
										<Card key={subject.id} className="group hover:shadow-md transition-shadow">
											<CardContent className="p-4">
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<div className="w-8 h-8 bg-linear-to-r from-blue-400 to-purple-400 rounded-md flex items-center justify-center text-white font-semibold text-sm">
															{subject.name.charAt(0)}
														</div>
														<div className="flex-1 min-w-0">
															<h3 className="font-medium text-sm group-hover:text-purple-600 transition-colors truncate">
																{subject.name}
															</h3>
															{parentSubject && (
																<p className="text-xs text-muted-foreground truncate">
																	{parentSubject.name}
																</p>
															)}
														</div>
													</div>

													<Button asChild size="sm" variant="outline" className="w-full">
														<Link href={`/app/chat?subject=${subject.id}`}>
															<Brain className="h-3 w-3 mr-1" />
															Ask
														</Link>
													</Button>
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}