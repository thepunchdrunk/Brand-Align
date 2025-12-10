export const COUNTRIES = [
    "Global", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "China", "India",
    "Brazil", "Mexico", "Italy", "Spain", "South Korea", "Russia", "Netherlands", "Saudi Arabia", "Turkey", "Switzerland",
    "Taiwan", "Poland", "Sweden", "Belgium", "Thailand", "Ireland", "Austria", "Nigeria", "Argentina", "Norway",
    "Israel", "UAE", "Vietnam", "South Africa", "Singapore", "Denmark", "Malaysia", "Hong Kong", "Philippines", "Colombia",
    "Chile", "Finland", "Egypt", "Portugal", "Greece", "New Zealand", "Peru", "Kazakhstan", "Romania", "Ukraine",
    "Hungary", "Qatar", "Kuwait", "Morocco", "Slovakia", "Ecuador", "Oman", "Dominican Republic", "Puerto Rico", "Kenya",
    "Angola", "Ethiopia", "Sri Lanka", "Guatemala", "Uzbekistan", "Myanmar", "Luxembourg", "Bulgaria", "Croatia", "Belarus",
    "Uruguay", "Lithuania", "Serbia", "Slovenia", "Costa Rica", "Panama", "Ivory Coast", "Tanzania", "Cameroon", "Uganda",
    "Ghana", "Jordan", "Tunisia", "Bahrain", "Bolivia", "Paraguay", "Latvia", "Estonia", "Cyprus", "Iceland", "El Salvador",
    "Honduras", "Nepal", "Trinidad & Tobago", "Cambodia", "Zimbabwe", "Senegal", "Papua New Guinea"
].sort((a, b) => a === "Global" ? -1 : b === "Global" ? 1 : a.localeCompare(b));
