<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to MotoCraft-TwoHeads</h1>
        <p>
          Your trusted motorcycle workshop management app, where enthusiasts, mechanics, and riders come together to share and validate maintenance knowledge. Join us today and contribute your experiences while earning rewards and recognition.
        </p>
        <button class="hover-effect" @click="navigateToSignUp">Sign Up / Register</button>
      </div>
    </section>

    <section class="call-to-action-images">
      <!-- Collaborate with Community Image -->
      <div class="cta-image hover-effect">
        <img src="../assets/CollaborateCommunity.png" alt="Collaborate with Community" />
        <h2>Collaborate with Community</h2>
        <p>Work with fellow riders and mechanics to improve and validate the resources available to everyone.</p>
      </div>

      <!-- Validate and Earn Rewards Image -->
      <div class="cta-image hover-effect">
        <img src="../assets/ValidateEarnRewards.png" alt="Validate and Earn Rewards" />
        <h2>Validate and Earn Rewards</h2>
        <p>Help validate maintenance tasks, parts, and costs, and earn rewards for your contributions.</p>
      </div>

      <!-- Add Parts, Tasks, and Costs Image -->
      <div class="cta-image hover-effect">
        <img src="../assets/AddPartsTasksCosts.png" alt="Add Parts, Tasks, and Costs" />
        <h2>Add Parts, Tasks, and Costs</h2>
        <p>Contribute your knowledge on motorcycle parts, tasks, and costs to help others with their projects.</p>
      </div>
    </section>
    
    <!-- New Features Coming Soon Section -->
    <section class="upcoming-features">
      <h2>New Features Coming Soon</h2>
      <div class="features-grid">
        <div class="feature-card">
          <span class="material-symbols-outlined">inventory_2</span>
          <h3>Inventory Management</h3>
          <p>Connect directly to inventory systems to track parts availability and pricing</p>
        </div>
        <div class="feature-card">
          <span class="material-symbols-outlined">phone_iphone</span>
          <h3>Mobile App</h3>
          <p>Access your workshop projects on the go with our upcoming mobile application</p>
        </div>
        <div class="feature-card">
          <span class="material-symbols-outlined">workspace_premium</span>
          <h3>Premium Features</h3>
          <p>Unlock advanced tools with our subscription plans, perfect for professional shops</p>
        </div>
        <div class="feature-card">
          <span class="material-symbols-outlined">shield</span>
          <h3>Enhanced Security</h3>
          <p>Advanced data protection and sanitized inputs for workshop management</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToSignUp = () => {
  router.push({ name: "SignUp" });
};
</script>

<style scoped>
.home-page {
  padding: 0;
  font-family: 'Inter', sans-serif;
  text-align: center;
  max-width: 100vw;
  overflow-x: hidden;
}

.hero {
  margin-bottom: 60px;
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  padding: 80px 20px;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%234fd1c5' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E");
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 2.8em;
  margin-bottom: 24px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: fadeInDown 0.8s ease-out;
}

.hero p {
  font-size: 1.3em;
  margin-bottom: 32px;
  line-height: 1.6;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero button {
  padding: 16px 32px;
  background-color: #4fd1c5;
  color: #1a202c;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(79, 209, 197, 0.5);
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero button:hover {
  background-color: #38b2ac;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 209, 197, 0.6);
}

.hero button:active {
  transform: translateY(1px);
}

.call-to-action-images {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;
  padding: 0 20px;
  margin-bottom: 60px;
}

.cta-image {
  flex: 1;
  min-width: 280px;
  max-width: 360px;
  margin: 0;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  transform: translateY(0);
}

.cta-image:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.cta-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, #4fd1c5, #38b2ac);
}

.cta-image img {
  width: 80%;
  height: auto;
  margin: 0 auto 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.cta-image:hover img {
  transform: scale(1.05);
}

.cta-image h2 {
  font-size: 1.6em;
  margin-bottom: 16px;
  color: #1a202c;
  font-weight: 600;
}

.cta-image p {
  font-size: 1.1em;
  line-height: 1.6;
  color: #4a5568;
}

/* Upcoming features section */
.upcoming-features {
  background-color: #f9fafb;
  padding: 60px 20px;
  margin-bottom: 60px;
}

.upcoming-features h2 {
  font-size: 2.2em;
  color: #1a202c;
  margin-bottom: 40px;
  font-weight: 700;
  position: relative;
  display: inline-block;
}

.upcoming-features h2::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #4fd1c5, #38b2ac);
  border-radius: 2px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 30px 25px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.feature-card .material-symbols-outlined {
  font-size: 48px;
  color: #4fd1c5;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.4em;
  color: #1a202c;
  margin-bottom: 15px;
  font-weight: 600;
}

.feature-card p {
  font-size: 1em;
  color: #4a5568;
  line-height: 1.6;
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero {
    padding: 60px 20px;
  }
  
  .hero h1 {
    font-size: 2.2em;
  }
  
  .hero p {
    font-size: 1.1em;
    padding: 0 10px;
  }
  
  .call-to-action-images {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-image {
    width: 100%;
    max-width: 400px;
    margin-bottom: 30px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
  
  .upcoming-features h2 {
    font-size: 1.8em;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 1.8em;
  }
  
  .hero p {
    font-size: 1em;
  }
  
  .hero button {
    width: 100%;
    max-width: 280px;
  }
  
  .feature-card {
    padding: 20px 15px;
  }
  
  .feature-card .material-symbols-outlined {
    font-size: 36px;
  }
}
</style>

