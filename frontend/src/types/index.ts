export interface User {
    login: string;
    avatar_url: string;
    name: string | null;
    bio: string | null;
    followers: number;
    following: number;
    public_repos: number;
  }
  
  export interface Repository {
    name: string;
    description: string;  // Changed from string | null
    language: string;     // Changed from string | null
    verified: boolean;
    stars: number;
  }
  
  export interface DetailedRepository extends Repository {
    avatar_url: string;
    categories: string[];
  }