# -*- coding: utf-8 -*-
"""Test_group_making.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1MOdFq2_khVBdFfgU0GKSKQL1__XrPA1w
"""

import random
import math

def get_number_of_teams(max_team_size:int, students:list) -> int:
  return math.ceil(len(students) / max_team_size)

class student:
  def __init__(self, id:int, skillset:list): #team structure that saves student_id, value of team and skillset
    self.id = id
    self.skillset = skillset
  def get_id(self) -> int:
    return self.id
  def get_skillset(self) -> list:
    return self.skillset
  def __str__(self):
    return self.id

class team:
  def __init__(self, students:list, skillset:list): #team structure that saves student_id, value of team and skillset
    self.students = students
    self.skillset = skillset
  def get_value(self) -> float:
    value = sum(self.skillset)
    return value
  def get_students(self) -> list:
    return self.students
  def append_student(self, s:student) -> None:
    self.students.append(s)
    student_skillset = (s.get_skillset())
    temp_skillset = []
    for i in range(len(student_skillset)):
      temp_skillset.append(int(student_skillset[i]) | int(self.skillset[i]))
    self.skillset = temp_skillset
  def get_skillset(self) -> list:
    return self.skillset
  def __str__(self) -> str:
    return str(self.get_value())
  def get_size(self) -> int:
    return len(self.students)

def greedy_team_formation(students:list, max_team_size:int) -> None:
  teams = [] #save the team id as a key, team members id and the skillset of the team as object
  n_teams = get_number_of_teams(max_team_size, students)
  students_available = students
  actual_n_teams = 0
  while(len(teams) < n_teams and len(students_available) > 0):
    stud = random.choice(students_available) #randomly choosing the first student
    teams.append(team([stud], stud.get_skillset()))
    students_available.remove(stud) #we remove the student from the possible choices
    while((teams[actual_n_teams]).get_size() < max_team_size) and (len(students_available) > 0):
      actual_team = teams[actual_n_teams]
      actual_skillset = actual_team.get_skillset()
      missing_skills_indices = [i for i, x in enumerate(actual_skillset) if x == 0] #we search for the indeces of all the missing skills for the team
      
      matching = False

      for index in missing_skills_indices: #we search bw the possible choices the ones that could satisfy the missing skills
        matching = {s for s in students_available if s.get_skillset()[index] == 1}
        if(matching):
          break;
      
      if(matching):
        best_gain = 0
        
        for s in students_available:
          candidate_skillset = teams[actual_n_teams].get_skillset()
          s_skillset = s.get_skillset()
          temp_skillset = (candidate_skillset[i] | s_skillset[i] for i in range(len(s.get_skillset())))
          #gain = sum((candidate_skillset[i] | s_skillset[i] for i in range(len(s.get_skillset()))) - teams[actual_n_teams].get_value())
          actual_value = teams[actual_n_teams].get_value()
          gain = sum((temp_skillset) - (actual_value))
          if(best_gain < gain):
            best_gain = gain
            best_match = s
            
        students_available.remove(best_match)

        teams[actual_n_teams].append_student(best_match)
        
      else:
        random_stud = random.choice(students_available) #randomly choosing the student
        students_available.remove(random_stud) #we remove the student from the possible choices
        teams[actual_n_teams].append_student(random_stud)

      print(len(students_available))

    actual_n_teams += 1

  for t in teams:
    print(t, *t.get_skillset())

def random_binary_string(length:int)->list:
    # Generate a random binary string with the specified length
    binary_string = ''.join(str(random.randint(0, 1)) for _ in range(length))
    return binary_string


def generate_fake_data(max_students:int)->list:
  students = []
  i = 0
  while(i < max_students):
    students.append(student(i, random_binary_string(10)))
    i += 1

  return students

a = generate_fake_data(150)

student1 = student(0, [1,0,0])
student2 = student(0, [1,0,1])

greedy_team_formation(a, 4)