from db import init_db
from recognizer import recognize_and_insert


def main():
    init_db()
    result = recognize_and_insert()
    if result:
        print("\nProduct recognized:")
        for key, value in result.items():
            print(f"  {key}: {value}")
    else:
        print("\nNo product recognized.")


if __name__ == "__main__":
    main()
