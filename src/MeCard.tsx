import photoUrl from './assets/me.jpg';

const MeCard = () => {
  const currentDate = new Date();
  let currentYear = new Date().getFullYear();
  // if current month is less than August, then subtract 1 from current year
  if (new Date().getMonth() < 8) currentYear--;

  const age = currentYear - 1986;
  const firstEmploymentDate = new Date(2009, 8, 1);
  const yearsOfExperience = currentDate.getFullYear() - firstEmploymentDate.getFullYear();

  return (
    <figure class="flex my-8 bg-white-600 w-full px-4 py-2 backdrop-blur-sm border border-slate-200">
      <img class="w-32 h-32 rounded-full ml-auto mr-4 border-4 border-slate-300" src={photoUrl} alt="Oleg Dolotov" />
      <figcaption class="text-lg mr-auto ml-4 py-4">
        <h1 class="text-3xl">Oleg Dolotov</h1>
        <h2 class="mt-4 text-2xl">Cloud/DevOps engineer & AI adoption lead, {yearsOfExperience} years of experience</h2>
        <p class="text-sm">{age} years old, digital nomad based in Thailand, father, beach volleyball player</p>
      </figcaption>
    </figure>
  );
}

export default MeCard;
