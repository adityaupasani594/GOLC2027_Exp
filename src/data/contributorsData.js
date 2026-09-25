// ─── Experiment Contributors Directory (KIRA Virtual Laboratory - GOLC 2027) ───

export const CONTRIBUTORS_MAP = {
  1: [
    'Akshhad Ahuja',
    'Pranjal Ahuja',
    'Sanjay Aski',
    'Hitesh Bajaj',
    'Moneet Bhiwandkar'
  ],
  2: [
    'Shravani Bhosale',
    'Manav Bodhani',
    'Garv Chandnani',
    'Aadi Singh Chauhan',
    'Mohit Chawla'
  ],
  3: [
    'Jai Desar',
    'Ryan Dsouza',
    'Vedika Dhamale',
    'Soham Dharmik'
  ],
  4: [
    'Vedant Shashikant Gawali',
    'Bhumik Haresh Gianani',
    'Atharva Girkar',
    'Shreya Gokhale',
    'Sukhbir Singh Goklani',
    'Rahul Guhagarkar',
    'Aanchal Gupta',
    'Akash Jadhav',
    'Ishan Jadhav',
    'Riddhi Jangale'
  ],
  5: [
    'Sahil Jethnani',
    'Shivam Jha',
    'Prathamesh Joshi',
    'Sahil Kachre',
    'Soham Kamathi',
    'Nikhil Janyani',
    'Yash Katiyara',
    'Harshavardhan Khamkar',
    'Bhavishya Shadani'
  ],
  6: [
    'Ushma Sukhwani',
    'Sahil Tanwani',
    'Kunal Teli',
    'Priya Tolani',
    'Yash Sharma',
    'Ayush Shelar',
    'Mansi Tahilani',
    'Varoon Tekwani'
  ],
  7: [
    'Vivan Tulsi',
    'Rithik Chawla',
    'Ayush Parwani',
    'Vaibhav Thadwani'
  ],
  8: [
    'Bhoomika Makhija',
    'Mohit Mehta',
    'Purva Mhatre',
    'Simran Talreja',
    'Preetika Khilnaney',
    'Prajwal Kulkarni',
    'Sakshi Kukreja',
    'Gaurav Khutwal',
    'Purab Keshwani'
  ],
  9: [
    'Dhruv Ashok Lohana',
    'Neha Mankani',
    'Peehu Makhija',
    'Shubham Mishra',
    'Riddhi Menghrajani'
  ],
  10: [
    'Isha Palkar',
    'Dhruwal Panchal',
    'Pradnya Patil',
    'Soham Patil'
  ],
  11: [
    'Sonal Patil',
    'Diksha Patkar',
    'Veda Patki',
    'Akul Patre',
    'Bikas Paul',
    'Shivam Makhija',
    'Paawan Matani',
    'Manas Mungekar',
    'Sohan Nagothi'
  ],
  12: [
    'Sandesh Pherwani',
    'Purab Puraswani',
    'Sidhant Ramrakhiani',
    'Ritika Sabhani',
    'Meghana Poojary',
    'Suhan Poojary',
    'Abhinav Racharla',
    'Dev Ramchandani',
    'Rochelle Teddy'
  ],
  13: [
    'Harshit Sachdev',
    'Aditya Sarvankar',
    'Rushikesh Shembade',
    'Sudarshan Gopal',
    'Yash Sukheja'
  ],
  14: [
    'Aliza Khan',
    'Manish Raje',
    'Alfiya Siddique',
    'Akritee Singh',
    'Ruchika Dingria'
  ],
  15: [
    'Aditya Upasani',
    'Vedant Mhatre',
    'Yash Mahajan'
  ]
};

export function getContributors(expNumber) {
  return CONTRIBUTORS_MAP[expNumber] || [];
}
