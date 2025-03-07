import { Link } from 'react-router-dom';
import { Printer, QrCode, BarChart2, Clock, Shield, FileText, Zap, Users } from 'lucide-react';
import { isAuthenticated } from '../utils/auth';
import { STATIC_VARIABLES } from '../config';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header - Fixed position */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg">
                <Printer className="h-8 w-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                {STATIC_VARIABLES.APP_NAME}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {isAuthenticated() ? (
                <>
                  <Link
                    to={STATIC_VARIABLES.PATHS.DASHBOARD}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Go to Dashboard
                  </Link>
                  {/* <Link
                    to={STATIC_VARIABLES.PATHS.ANALYTICS}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-md"
                  >
                    View Analytics
                  </Link> */}
                </>
              ) : (
                <>
                  <Link
                    to={STATIC_VARIABLES.PATHS.LOGIN}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Log in
                  </Link>
                  <Link
                    to={STATIC_VARIABLES.PATHS.REGISTER}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-md"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
            <div className="md:hidden">
              {/* Mobile menu button would go here */}
              <button className="text-gray-700">Menu</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content wrapper with padding-top to account for fixed header */}
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>

          {/* Geometric patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full"></div>
            <div className="absolute top-40 right-40 w-64 h-64 bg-white rounded-full"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-12 md:mb-0">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
                  <span className="block">{STATIC_VARIABLES.LANDING_PAGE.HERO_TITLE.split(' Made ')[0]}</span>
                  <span className="block mt-2">
                    Made <span className="text-yellow-300">Effortless</span>
                  </span>
                </h1>
                <p className="mt-6 text-xl md:text-2xl text-blue-100 leading-relaxed max-w-lg">
                  {STATIC_VARIABLES.LANDING_PAGE.HERO_SUBTITLE}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to={STATIC_VARIABLES.PATHS.REGISTER}
                    className="bg-white text-indigo-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    {STATIC_VARIABLES.LANDING_PAGE.CTA_TRIAL_TEXT}
                  </Link>
                  <Link
                    to={STATIC_VARIABLES.PATHS.DEMO}
                    className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition"
                  >
                    {STATIC_VARIABLES.LANDING_PAGE.CTA_DEMO_TEXT}
                  </Link>
                </div>

                <div className="mt-10 flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-${i * 100} flex items-center justify-center`}
                      >
                        <span className="text-white text-xs font-bold">{i}</span>
                      </div>
                    ))}
                  </div>
                  <div className="ml-4">
                    <p className="text-white font-medium">{STATIC_VARIABLES.LANDING_PAGE.TRUST_TEXT}</p>
                    <div className="flex items-center mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-white">{STATIC_VARIABLES.LANDING_PAGE.RATING_TEXT}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-1/2 flex justify-center">
                <div className="relative">
                  {/* Mock dashboard in a device frame */}
                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-8 border-gray-800 w-full max-w-lg">
                    <div className="bg-gray-800 h-6 flex items-center">
                      <div className="flex space-x-2 ml-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-100">
                      <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-gray-800">Print Queue Dashboard</h3>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Live
                          </span>
                        </div>
                        <div className="space-y-3">
                          {[
                            { name: 'invoice_march.pdf', status: 'Printing', icon: FileText, color: 'blue' },
                            { name: 'presentation_final.pptx', status: 'Waiting', icon: FileText, color: 'yellow' },
                            { name: 'contract_signed.pdf', status: 'Completed', icon: FileText, color: 'green' },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                              <div className="flex items-center">
                                <item.icon className={`h-5 w-5 text-${item.color}-500 mr-2`} />
                                <span className="text-sm font-medium">{item.name}</span>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full bg-${item.color}-100 text-${item.color}-800`}
                              >
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating elements for visual interest */}
                  <div className="absolute -top-6 -right-6 bg-yellow-400 rounded-lg p-4 shadow-lg transform rotate-6">
                    <QrCode className="h-12 w-12 text-indigo-900" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-indigo-600 rounded-lg p-3 shadow-lg">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-1.5 rounded-full">
                HOW IT WORKS
              </span>
              <h2 className="mt-6 text-4xl font-bold text-gray-900">
                {STATIC_VARIABLES.LANDING_PAGE.HOW_IT_WORKS_TITLE}
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                {STATIC_VARIABLES.LANDING_PAGE.HOW_IT_WORKS_SUBTITLE}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {STATIC_VARIABLES.LANDING_PAGE.FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl w-14 h-14 flex items-center justify-center mb-6">
                    {i === 0 && <QrCode className="h-7 w-7 text-white" />}
                    {i === 1 && <Printer className="h-7 w-7 text-white" />}
                    {i === 2 && <BarChart2 className="h-7 w-7 text-white" />}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.TITLE}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.DESCRIPTION}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section with Stats */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="md:w-1/2">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-1.5 rounded-full">
                  BENEFITS
                </span>
                <h2 className="mt-6 text-4xl font-bold text-gray-900">
                  {STATIC_VARIABLES.LANDING_PAGE.BENEFITS_TITLE}
                </h2>
                <p className="mt-4 text-xl text-gray-600">
                  {STATIC_VARIABLES.LANDING_PAGE.BENEFITS_SUBTITLE}
                </p>

                <div className="mt-10 space-y-8">
                  {STATIC_VARIABLES.LANDING_PAGE.BENEFITS.map((benefit, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="bg-blue-100 rounded-lg p-3">
                          {i === 0 && <Clock className="h-6 w-6 text-blue-700" />}
                          {i === 1 && <Shield className="h-6 w-6 text-blue-700" />}
                          {i === 2 && <Users className="h-6 w-6 text-blue-700" />}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{benefit.TITLE}</h3>
                        <p className="mt-2 text-gray-600 leading-relaxed">{benefit.DESCRIPTION}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:w-1/2 grid grid-cols-2 gap-6">
                {STATIC_VARIABLES.LANDING_PAGE.STATS.map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                    <h4 className="text-4xl font-extrabold text-blue-600">{stat.NUMBER}</h4>
                    <p className="mt-2 text-gray-700 font-medium">{stat.LABEL}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full"></div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white">
              {STATIC_VARIABLES.LANDING_PAGE.FINAL_CTA_TITLE}
            </h2>
            <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
              {STATIC_VARIABLES.LANDING_PAGE.FINAL_CTA_SUBTITLE}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={STATIC_VARIABLES.PATHS.REGISTER}
                className="bg-white text-indigo-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl"
              >
                {STATIC_VARIABLES.LANDING_PAGE.CTA_TRIAL_TEXT}
              </Link>
              <Link
                to={STATIC_VARIABLES.PATHS.DEMO}
                className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition"
              >
                {STATIC_VARIABLES.LANDING_PAGE.CTA_SCHEDULE_TEXT}
              </Link>
            </div>
            <p className="mt-6 text-blue-200">No credit card required. Cancel anytime.</p>
          </div>
        </section>
      </main>

      {/* Simplified Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center">
            <p className="text-gray-400 mb-4 sm:mb-0">
              © {STATIC_VARIABLES.LANDING_PAGE.FOOTER_YEAR} {STATIC_VARIABLES.APP_NAME}. All rights
              reserved.
            </p>
            <div>
              <a href="#" className="text-gray-400 hover:text-white">
                Privacy Policy
              </a>
              <span className="mx-3 text-gray-600">|</span>
              <a href="#" className="text-gray-400 hover:text-white">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;