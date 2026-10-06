import styles from './App.module.css';
import Telegramicon from './svg/Telegramicon';
import LinkedinIcon from './svg/linkedin-svgrepo-com.svg'
import Soundcloudicon from './svg/soundcloudicon';
import StackoverflowIcon from './svg/stackicon';

const AboutMe = () => {
  const containerClasses = 'container mx-auto px-4 my-8 flex flex-col items-center max-w-7xl';
  const borderClasses = 'border border-slate-200';

  return (
    <div class={`${styles.content} ${containerClasses}`}>
      <div class={`flex flex-col mb-4 bg-white-600 w-full px-4 py-2 backdrop-blur-sm ${borderClasses}`}>
        <h2 class="text-2xl">Social networks:</h2>
        <ul class="text-xl list-image-none flex">
          <li><a href="https://www.linkedin.com/in/oleg-dolotov-96a053aa">
            LinkedinIcon
          </a></li>
          <li><a href="https://github.com/osharper">GitHub</a></li>
          <li><a href="https://www.stackoverflow.com/users/1048482/osharper">
            <StackoverflowIcon />
            </a></li>
          <li><a href="https://t.me/osharper">
            <Telegramicon />
          </a></li>
          <li><a href="https://soundcloud.com/osharper">
            <Soundcloudicon />
          </a></li>
        </ul>
      </div>

      <div class={`mb-4 bg-white-600 w-full px-4 py-2 backdrop-blur-sm ${borderClasses}`}>
        <p>Hello! Welcome to my GitHub page. I use it for various experiments with modern web technologies. You can find some of the results in Experiments section if you're curious. This page is made with Solid.js with tsParticles on the background</p>
      </div>

      <div class={`mb-4 bg-white-600 w-full px-4 py-2 backdrop-blur-sm ${borderClasses}`}>
        <h2 class="text-3xl">About me</h2>
        <p>
            I have more than a decade of experience building web applications and cloud infrastructure — Node.js, React, .NET, MongoDB, and AWS/GCP/Azure. My current focus is cloud infrastructure and DevOps (AWS EKS, Docker/Kubernetes) and, most recently, leading AI adoption across engineering teams — bringing LLM-assisted and agentic coding workflows into day-to-day development. I'm not limited to one stack (my main languages nowadays are C#, JS/TS and Python) and I'm always exploring something new — currently Unity3D, Go, Rust, and self-hosted AI tooling.
        </p>
        <p>
            For eight years I've worked at Showd.me, a fast-growing employee training and certification platform — starting as a full-stack developer and growing into leading its AI adoption initiative. Along the way I've built data-driven reporting on raw ElasticSearch event data, PDF generation and bundling in AWS Lambda, and integrations with EMS systems with complex APIs, while coordinating server-side, client-side, and storage work across a dedicated team.
        </p>
        <p>
            I have a strong understanding of the principles of software development, including SOLID, DRY, KISS, and YAGNI, and experience with MVC, MVVM, and CQRS, Agile/Scrum/Kanban, and CI/CD (GitHub Actions and others).
        </p>
      </div>

      <div class={`mb-4 bg-white-600 w-full px-4 py-2 backdrop-blur-sm ${borderClasses}`}>
        <h2 class="text-3xl">Outside work</h2>
        <p>
          I live as a digital nomad on Ko Pha-ngan, Thailand, with my family. When I'm not at a screen I'm usually on the beach volleyball court, drinking too much tea, or in the greenhouse — I'm slowly building a small home farm and greenhouse automation setup, and would love to hear from anyone doing similar tropical growing or garden-automation projects.
        </p>
        <p>
          I also build things for fun: a gamified, family-friendly task-management system (think GTD meets tabletop RPG), and a Telegram bot that runs signups for my local beach volleyball group with Google Calendar integration and an AI assistant. Both are early-stage and not public yet — if any of this overlaps with what you're building, or you'd like to compare notes, reach out.
        </p>
      </div>
    </div>
  );
}

export default AboutMe;
