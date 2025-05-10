<template>
  <section class="guest-demo-section">
    <div class="demo-content">
      <div class="demo-header">
        <h2>Try MotoCraft as a Guest</h2>
        <div class="badge-container">
          <span class="badge">No Sign-up Required</span>
          <span class="badge limited">24-Hour Access</span>
        </div>
      </div>
      
      <p class="demo-description">
        Experience select features without creating an account. Guest access is perfect for exploring our basic tools before committing.
      </p>
      
      <div class="feature-comparison">
        <div class="comparison-col guest">
          <h3>Guest Demo Includes:</h3>
          <ul class="feature-list">
            <li class="available">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Basic Project Viewing</span>
            </li>
            <li class="available">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Parts Catalog Browsing</span>
            </li>
            <li class="available">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Sample Task Management</span>
            </li>
            <li class="unavailable">
              <span class="material-symbols-outlined">cancel</span>
              <span>Save Your Projects</span>
            </li>
            <li class="unavailable">
              <span class="material-symbols-outlined">cancel</span>
              <span>Premium Features</span>
            </li>
            <li class="unavailable">
              <span class="material-symbols-outlined">cancel</span>
              <span>Community Contributions</span>
            </li>
          </ul>
          <button class="guest-button" @click="continueAsGuest">
            Continue as Guest
          </button>
          <p class="limitation-note">
            <span class="material-symbols-outlined">timer</span>
            Guest access expires after 24 hours
          </p>
        </div>
        
        <div class="divider">
          <span>VS</span>
        </div>
        
        <div class="comparison-col registered">
          <h3>Registered Users Get:</h3>
          <ul class="feature-list">
            <li class="available">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Unlimited Project Creation</span>
            </li>
            <li class="available">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Full Parts Database Access</span>
            </li>
            <li class="available">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Complete Task Management</span>
            </li>
            <li class="available">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Save & Export Your Work</span>
            </li>
            <li class="available">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Access to Premium Features</span>
            </li>
            <li class="available">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Community Contribution</span>
            </li>
          </ul>
          <button class="signup-button" @click="navigateToSignUp">
            Sign Up Now
          </button>
          <p class="benefit-note">
            <span class="material-symbols-outlined">verified</span>
            Free account with premium upgrade options
          </p>
        </div>
      </div>
      
      <div class="demo-limitations">
        <h3>Guest Demo Limitations</h3>
        <ul class="limitations-list">
          <li>
            <span class="material-symbols-outlined warning">schedule</span>
            <div>
              <strong>Time-Limited:</strong>
              <span>All guest access expires after 24 hours</span>
            </div>
          </li>
          <li>
            <span class="material-symbols-outlined warning">cloud_off</span>
            <div>
              <strong>No Data Saved:</strong>
              <span>Projects and tasks are not saved after session ends</span>
            </div>
          </li>
          <li>
            <span class="material-symbols-outlined warning">block</span>
            <div>
              <strong>Feature Restrictions:</strong>
              <span>Advanced features not available in guest mode</span>
            </div>
          </li>
          <li>
            <span class="material-symbols-outlined warning">group_off</span>
            <div>
              <strong>No Collaboration:</strong>
              <span>Cannot participate in community features</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { activateDemo } from '@/services/demoService';

const router = useRouter();
const userStore = useUserStore();

const navigateToSignUp = () => {
  router.push({ name: 'SignUp' });
};

const continueAsGuest = async () => {
  const success = activateDemo();
  
  if (success) {
    if (!userStore.user) {
      await userStore.loginAnonymously();
    }
    
    // Redirect to the parts catalog as a demo starting point
    router.push({ name: 'listParts' });
  }
};
</script>

<style scoped>
.guest-demo-section {
  padding: 3rem 1.5rem;
  background-color: var(--color-bg-tertiary);
  margin: 2rem 0;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.demo-content {
  max-width: 1000px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.demo-header h2 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: var(--color-text-primary);
}

.badge-container {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.badge {
  display: inline-block;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-full);
  background-color: var(--color-info-light);
  color: var(--color-info);
  font-size: 0.9rem;
  font-weight: 600;
}

.badge.limited {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.demo-description {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 2.5rem;
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.feature-comparison {
  display: flex;
  align-items: stretch;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.comparison-col {
  flex: 1;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
}

.comparison-col.guest {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
}

.comparison-col.registered {
  background-color: var(--color-primary-light);
  border: 1px solid var(--color-primary);
}

.comparison-col h3 {
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
  text-align: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.feature-list {
  list-style-type: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  flex-grow: 1;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
}

.feature-list .material-symbols-outlined {
  font-size: 1.25rem;
}

.available .material-symbols-outlined {
  color: var(--color-success);
}

.unavailable .material-symbols-outlined {
  color: var(--color-text-tertiary);
}

.unavailable span:last-child {
  color: var(--color-text-tertiary);
  text-decoration: line-through;
  opacity: 0.8;
}

.guest-button, .signup-button {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-top: auto;
}

.guest-button {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.signup-button {
  background-color: var(--color-primary);
  color: white;
}

.guest-button:hover {
  background-color: var(--color-bg-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.signup-button:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
}

.divider span {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-text-tertiary);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.9rem;
}

.limitation-note, .benefit-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  margin-top: 0.75rem;
  justify-content: center;
}

.limitation-note {
  color: var(--color-warning);
}

.benefit-note {
  color: var(--color-success);
}

.limitation-note .material-symbols-outlined,
.benefit-note .material-symbols-outlined {
  font-size: 1rem;
}

.demo-limitations {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--color-border);
}

.demo-limitations h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  text-align: center;
}

.limitations-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.limitations-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.limitations-list .material-symbols-outlined.warning {
  color: var(--color-warning);
  font-size: 1.5rem;
}

.limitations-list li div {
  display: flex;
  flex-direction: column;
}

.limitations-list li strong {
  margin-bottom: 0.25rem;
  color: var(--color-text-primary);
}

.limitations-list li span {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 900px) {
  .feature-comparison {
    flex-direction: column;
  }
  
  .divider {
    width: 100%;
    margin: 0.5rem 0;
  }
  
  .comparison-col {
    width: 100%;
  }
  
  .limitations-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .guest-demo-section {
    padding: 2rem 1rem;
  }
  
  .demo-header h2 {
    font-size: 1.5rem;
  }
  
  .demo-description {
    font-size: 1rem;
  }
  
  .badge-container {
    flex-wrap: wrap;
  }
}
</style>