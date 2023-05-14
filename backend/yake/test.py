class Student(object):
    def __init__(self,ids):
        self.ids = ids

    def __repr__(self):
        return "Hello"

    def __str__(self):
        return str(8)


if __name__ == "__main__":
    s = Student(3)
    print(repr(s))
    print(str(s))
