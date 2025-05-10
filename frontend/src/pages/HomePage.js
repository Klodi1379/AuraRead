import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl -z-10" />
        
        <div className="max-w-5xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
          <div className="fade-in">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary-900 sm:text-5xl md:text-6xl">
              Welcome to <span className="text-primary-600">AuraRead</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Transform the way you interact with PDF documents with intelligent reading and annotation features
            </p>
          </div>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center fade-in" style={{animationDelay: "0.2s"}}>
            {isAuthenticated ? (
              <>
                <Link to="/documents" className="btn btn-primary text-base sm:text-lg px-8 py-3 rounded-lg">
                  View My Documents
                </Link>
                <Link to="/upload" className="btn btn-secondary text-base sm:text-lg px-8 py-3 rounded-lg">
                  Upload New Document
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary text-base sm:text-lg px-8 py-3 rounded-lg">
                  Get Started
                </Link>
                <Link to="/register" className="btn btn-secondary text-base sm:text-lg px-8 py-3 rounded-lg">
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Powerful Features
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to enhance your reading experience in one place
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Audio Reading',
                description: 'Listen to your documents with advanced text-to-speech technology',
                icon: 'svg-speaker'
              },
              {
                title: 'Smart Annotations',
                description: 'Highlight important sections and add notes for future reference',
                icon: 'svg-bookmark'
              },
              {
                title: 'Organized Library',
                description: 'Keep all your documents in one place, easily accessible anytime',
                icon: 'svg-folder'
              },
              {
                title: 'Language Support',
                description: 'Work with documents in multiple languages',
                icon: 'svg-globe'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="card card-hover p-6 h-full flex flex-col slide-up"
                style={{animationDelay: `${0.1 * index}s`}}
              >
                <div className="rounded-lg p-2 bg-primary-100 w-fit mb-5">
                  {feature.icon === 'svg-speaker' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                  {feature.icon === 'svg-bookmark' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  )}
                  {feature.icon === 'svg-folder' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  )}
                  {feature.icon === 'svg-globe' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 flex-grow">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* User Types Section */}
      <section className="py-12 bg-gray-50 rounded-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Who Can Benefit
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              AuraRead is designed for everyone who works with PDF documents
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <ul className="space-y-4">
              {[
                {
                  type: 'Students',
                  description: 'Studying educational materials',
                  icon: 'svg-academic'
                },
                {
                  type: 'Professionals',
                  description: 'Reviewing reports and documentation',
                  icon: 'svg-briefcase'
                },
                {
                  type: 'Researchers',
                  description: 'Analyzing literature and papers',
                  icon: 'svg-book'
                },
                {
                  type: 'Vision Impaired',
                  description: 'Individuals with reading difficulties',
                  icon: 'svg-eye'
                },
                {
                  type: 'Language Learners',
                  description: 'Improving comprehension in new languages',
                  icon: 'svg-language'
                }
              ].map((user, index) => (
                <li 
                  key={index}
                  className="flex items-center bg-white rounded-xl p-4 shadow-sm slide-up"
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                      {user.icon === 'svg-academic' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                      )}
                      {user.icon === 'svg-briefcase' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                      {user.icon === 'svg-book' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                      {user.icon === 'svg-eye' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                      {user.icon === 'svg-language' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{user.type}</h3>
                    <p className="text-base text-gray-600">{user.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-primary-700 rounded-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-xl text-primary-100 max-w-2xl mx-auto">
            Join thousands of users who have transformed their reading experience
          </p>
          <div className="mt-8 flex justify-center">
            <Link to={isAuthenticated ? "/upload" : "/register"} className="btn px-8 py-3 text-lg rounded-lg bg-white text-primary-700 hover:bg-primary-50 shadow-lg">
              {isAuthenticated ? "Upload Your First Document" : "Create Free Account"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;